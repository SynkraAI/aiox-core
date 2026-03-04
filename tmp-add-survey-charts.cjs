const fs = require('fs');

// ============================================================
// PART 1: Add surveyBreakdown to score-aggregator.ts
// ============================================================
const aggPath = '/opt/meta-ads-dashboard/server/services/score-aggregator.ts';
let agg = fs.readFileSync(aggPath, 'utf8');

// Add SurveyBreakdown types after SheetsAggregationResult
const newTypes = `

// ============================================================
// SURVEY BREAKDOWN (for donut charts)
// ============================================================

export interface AnswerDistribution {
  answer: string;
  count: number;
  pct: number;
}

export interface QuestionBreakdown {
  question: string;
  total: number;
  distribution: AnswerDistribution[];
}

export interface SurveyBreakdownResult {
  questions: QuestionBreakdown[];
  totalResponses: number;
}
`;

// Insert types before the DATE NORMALIZATION section
agg = agg.replace(
  '// ============================================================\n// DATE NORMALIZATION',
  newTypes + '// ============================================================\n// DATE NORMALIZATION'
);

// Add the breakdown function before the closing of the file
const breakdownFn = `

// ============================================================
// SURVEY BREAKDOWN BY UTM (for donut charts)
// ============================================================

export async function getSurveyBreakdown(
  config: SheetsConfig,
  dateFilter?: { since?: string; until?: string },
  utmFilter?: { campaigns?: string[]; adsets?: string[]; ads?: string[] },
): Promise<SurveyBreakdownResult> {
  // 1. Read all leads + surveys
  const leadsArrays = await Promise.all(
    config.leads.map(l => readLeadsSheet(l.spreadsheetId)),
  );
  const allLeads: Lead[] = ([] as Lead[]).concat(...leadsArrays);

  const surveyArrays = await Promise.all(
    config.surveys.map(s => readSurveySheet(s.spreadsheetId)),
  );
  const allSurveys: SurveyEntry[] = ([] as SurveyEntry[]).concat(...surveyArrays);

  // 2. Filter leads by date
  let filteredLeads = allLeads;
  if (dateFilter?.since || dateFilter?.until) {
    filteredLeads = allLeads.filter(lead => {
      const d = normalizeDate(lead.dateStr);
      if (!d) return true;
      if (dateFilter.since && d < dateFilter.since) return false;
      if (dateFilter.until && d > dateFilter.until) return false;
      return true;
    });
  }

  // 3. Filter by UTM selections (cross-filter)
  if (utmFilter) {
    if (utmFilter.campaigns && utmFilter.campaigns.length > 0) {
      const set = new Set(utmFilter.campaigns.map(c => c.toLowerCase()));
      filteredLeads = filteredLeads.filter(l => set.has(normUtm(l.utmTerm).toLowerCase()));
    }
    if (utmFilter.adsets && utmFilter.adsets.length > 0) {
      const set = new Set(utmFilter.adsets.map(a => a.toLowerCase()));
      filteredLeads = filteredLeads.filter(l => set.has(normUtm(l.utmMedium).toLowerCase()));
    }
    if (utmFilter.ads && utmFilter.ads.length > 0) {
      const set = new Set(utmFilter.ads.map(a => a.toLowerCase()));
      filteredLeads = filteredLeads.filter(l => set.has(normUtm(l.utmContent).toLowerCase()));
    }
  }

  // 4. Match leads to surveys
  const { byEmail, byPhone } = buildSurveyLookup(allSurveys);
  const matchedSurveys: SurveyEntry[] = [];

  for (const lead of filteredLeads) {
    const survey = findSurveyForLead(lead, byEmail, byPhone);
    if (survey && Object.keys(survey.answers).length > 0) {
      matchedSurveys.push(survey);
    }
  }

  // 5. Build question -> answer -> count
  const questionMap = new Map<string, Map<string, number>>();

  for (const survey of matchedSurveys) {
    for (const [question, answer] of Object.entries(survey.answers)) {
      if (!answer || answer.trim() === '') continue;
      if (!questionMap.has(question)) questionMap.set(question, new Map());
      const answerMap = questionMap.get(question)!;
      answerMap.set(answer, (answerMap.get(answer) || 0) + 1);
    }
  }

  // 6. Build result
  const questions: QuestionBreakdown[] = [];
  for (const [question, answerMap] of Array.from(questionMap.entries())) {
    const total = Array.from(answerMap.values()).reduce((s, v) => s + v, 0);
    const distribution: AnswerDistribution[] = Array.from(answerMap.entries())
      .map(([answer, count]) => ({
        answer,
        count,
        pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);
    questions.push({ question, total, distribution });
  }

  return { questions, totalResponses: matchedSurveys.length };
}
`;

agg += breakdownFn;
fs.writeFileSync(aggPath, agg, 'utf8');
console.log('OK 1/3 - score-aggregator.ts updated');


// ============================================================
// PART 2: Add tRPC endpoint to routers.ts
// ============================================================
const routerPath = '/opt/meta-ads-dashboard/server/routers.ts';
let router = fs.readFileSync(routerPath, 'utf8');

// Add import for getSurveyBreakdown
if (!router.includes('getSurveyBreakdown')) {
  router = router.replace(
    "import { aggregateScoresFromSheets } from './services/score-aggregator';",
    "import { aggregateScoresFromSheets, getSurveyBreakdown } from './services/score-aggregator';"
  );

  // If the import doesn't exist in that exact form, try alternatives
  if (!router.includes('getSurveyBreakdown')) {
    // Find any import from score-aggregator and add to it
    router = router.replace(
      /from ['"]\.\/services\/score-aggregator['"];/,
      (match) => match.replace("';", ", getSurveyBreakdown';").replace('";', ', getSurveyBreakdown";')
    );
  }

  // If still not found, add a new import line
  if (!router.includes('getSurveyBreakdown')) {
    router = "import { getSurveyBreakdown } from './services/score-aggregator';\n" + router;
  }
}

// Add the endpoint before the last closing of the router
// Find a good insertion point - before the export or at the end of meta router
const endpointCode = `

  surveyBreakdown: publicProcedure
    .input(z.object({
      project: z.string(),
      since: z.string().optional(),
      until: z.string().optional(),
      campaigns: z.array(z.string()).optional(),
      adsets: z.array(z.string()).optional(),
      ads: z.array(z.string()).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const projectKey = input.project || (ctx as any).projectKey;
      if (!projectKey) return { questions: [], totalResponses: 0 };

      const { getProjectSheetsConfig } = await import('./services/sheets-config');
      const sheetsConfig = await getProjectSheetsConfig(projectKey);
      if (!sheetsConfig || !sheetsConfig.leads?.length || !sheetsConfig.surveys?.length) {
        return { questions: [], totalResponses: 0 };
      }

      return getSurveyBreakdown(
        sheetsConfig,
        { since: input.since, until: input.until },
        {
          campaigns: input.campaigns,
          adsets: input.adsets,
          ads: input.ads,
        },
      );
    }),
`;

// Insert before the last }); of the meta router
// Find "sheetsLeadScoring" or the last endpoint and add after it
const insertMarker = router.lastIndexOf('  }),\n});');
if (insertMarker > -1) {
  router = router.slice(0, insertMarker) + '  }),\n' + endpointCode + '\n});';
} else {
  // Try another pattern - find the closing of the meta router
  const lastRouter = router.lastIndexOf('});');
  if (lastRouter > -1) {
    router = router.slice(0, lastRouter) + endpointCode + '\n});';
  }
}

fs.writeFileSync(routerPath, router, 'utf8');
console.log('OK 2/3 - routers.ts updated');


// ============================================================
// PART 3: Add donut charts to Funil.tsx
// ============================================================
const funilPath = '/opt/meta-ads-dashboard/client/src/pages/Funil.tsx';
let funil = fs.readFileSync(funilPath, 'utf8');

// 3a. Add the survey breakdown query after existing queries
const queryCode = `
  // Survey breakdown for donut charts (cross-filtered)
  const selectedCampsArr = Array.from(selectedCampaigns);
  const selectedAdsetsArr = Array.from(selectedAdsets);
  const selectedAdsArr = Array.from(selectedAds);
  const { data: surveyBreakdown } = trpc.meta.surveyBreakdown.useQuery(
    {
      project: projectKey || "",
      since: scoreDateRange.since,
      until: scoreDateRange.until,
      campaigns: selectedCampsArr.length > 0 ? selectedCampsArr : undefined,
      adsets: selectedAdsetsArr.length > 0 ? selectedAdsetsArr : undefined,
      ads: selectedAdsArr.length > 0 ? selectedAdsArr : undefined,
    },
    { enabled: !!projectKey },
  );
`;

// Find the lead scoring query and add after it
const scoringQueryEnd = funil.indexOf('{ enabled: !!projectKey }');
if (scoringQueryEnd > -1) {
  // Find the next ); after this
  let insertPos = funil.indexOf(');', scoringQueryEnd);
  if (insertPos > -1) {
    insertPos += 2; // after );
    // Check if surveyBreakdown query already exists
    if (!funil.includes('surveyBreakdown')) {
      funil = funil.slice(0, insertPos) + '\n' + queryCode + funil.slice(insertPos);
    }
  }
}

// 3b. Add donut chart colors
const donutColors = `
  // Donut chart colors for survey breakdown
  const DONUT_COLORS = ["#3b82f6", "#ef4444", "#eab308", "#22c55e", "#a855f7", "#f97316", "#06b6d4", "#ec4899", "#6366f1", "#84cc16", "#14b8a6", "#f43f5e"];
`;

// Insert before the return statement
const returnIdx = funil.indexOf('return (');
if (returnIdx > -1 && !funil.includes('DONUT_COLORS')) {
  funil = funil.slice(0, returnIdx) + donutColors + '\n  ' + funil.slice(returnIdx);
}

// 3c. Add the donut charts section after the Lead Score section
// Find the closing of the Lead Score section and add donuts after it
const donutSection = `
        {/* SECTION 8: PESQUISA DE LEADS - DONUT CHARTS */}
        {surveyBreakdown && surveyBreakdown.questions.length > 0 && (
          <Section number={8} title="Pesquisa de Leads">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="bg-card border border-border/50 rounded-lg px-4 py-2">
                  <div className="text-xs text-muted-foreground">Pontuacao Media</div>
                  <div className="text-2xl font-bold text-primary">{(leadScoring as any)?.summary?.avgScore?.toFixed(2) || "-"}</div>
                </div>
                <div className="bg-card border border-border/50 rounded-lg px-4 py-2">
                  <div className="text-xs text-muted-foreground">Respostas</div>
                  <div className="text-2xl font-bold">{surveyBreakdown.totalResponses}</div>
                </div>
              </div>
              {(selectedCampaigns.size > 0 || selectedAdsets.size > 0 || selectedAds.size > 0) && (
                <Badge variant="outline" className="text-xs text-primary border-primary/30">
                  Filtrado por selecao
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surveyBreakdown.questions.map((q: any, idx: number) => (
                <Card key={idx} className="bg-card border-border/50">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-sm font-medium truncate" title={q.question}>{q.question}</CardTitle>
                    <p className="text-[10px] text-muted-foreground">{q.total} respostas</p>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={q.distribution.slice(0, 10)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="count" nameKey="answer" stroke="none">
                          {q.distribution.slice(0, 10).map((_: any, i: number) => (
                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number, name: string) => [v + " (" + q.distribution.find((d: any) => d.answer === name)?.pct + "%)", name]} />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", color: "#a1a1aa" }} layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>
        )}
`;

// Find the closing of lead score section (before GRAFICOS DIARIOS or end)
const graficosMarker = '        {/* SECTION 6: GRAFICOS DIARIOS */}';
if (funil.includes(graficosMarker)) {
  funil = funil.replace(graficosMarker, donutSection + '\n' + graficosMarker);
} else {
  // Try to find any Section 6 or the end of the component
  const altMarker = funil.indexOf('SECTION 6');
  if (altMarker > -1) {
    const lineStart = funil.lastIndexOf('\n', altMarker);
    funil = funil.slice(0, lineStart) + '\n' + donutSection + funil.slice(lineStart);
  }
}

fs.writeFileSync(funilPath, funil, 'utf8');
console.log('OK 3/3 - Funil.tsx updated');

console.log('\nAll patches applied successfully!');
