const fs = require('fs');

// ============================================================
// PART 1: Backend - Enhance getSurveyBreakdown with answerFilter + UTM breakdown
// ============================================================
const aggPath = '/opt/meta-ads-dashboard/server/services/score-aggregator.ts';
let agg = fs.readFileSync(aggPath, 'utf8');

// 1a. Add UtmBreakdown interface after SurveyBreakdownResult
const newInterface = `

export interface UtmBreakdownItem {
  name: string;
  count: number;
  pct: number;
}

export interface SurveyUtmBreakdown {
  campaigns: UtmBreakdownItem[];
  adsets: UtmBreakdownItem[];
  ads: UtmBreakdownItem[];
}`;

agg = agg.replace(
  'export interface SurveyBreakdownResult {',
  newInterface + '\n\nexport interface SurveyBreakdownResult {'
);

// 1b. Add utmBreakdown to SurveyBreakdownResult
agg = agg.replace(
  '  questions: QuestionBreakdown[];\n  totalResponses: number;\n}',
  '  questions: QuestionBreakdown[];\n  totalResponses: number;\n  utmBreakdown?: SurveyUtmBreakdown;\n}'
);

// 1c. Enhance getSurveyBreakdown function signature to accept answerFilter
agg = agg.replace(
  `export async function getSurveyBreakdown(
  config: SheetsConfig,
  dateFilter?: { since?: string; until?: string },
  utmFilter?: { campaigns?: string[]; adsets?: string[]; ads?: string[] },
): Promise<SurveyBreakdownResult> {`,
  `export async function getSurveyBreakdown(
  config: SheetsConfig,
  dateFilter?: { since?: string; until?: string },
  utmFilter?: { campaigns?: string[]; adsets?: string[]; ads?: string[] },
  answerFilter?: { question: string; answer: string },
): Promise<SurveyBreakdownResult> {`
);

// 1d. After matchedSurveys, add answerFilter logic + UTM breakdown
// Find the "// 5. Build question -> answer -> count" line and add before it
const anchor5 = '  // 5. Build question -> answer -> count';
const answerFilterLogic = `  // 4b. If answerFilter, narrow to only leads whose survey matches
  let finalLeads = filteredLeads;
  if (answerFilter && answerFilter.question && answerFilter.answer) {
    finalLeads = filteredLeads.filter(lead => {
      const survey = findSurveyForLead(lead, byEmail, byPhone);
      if (!survey) return false;
      return survey.answers[answerFilter.question] === answerFilter.answer;
    });
    // Rebuild matchedSurveys from finalLeads
    matchedSurveys.length = 0;
    for (const lead of finalLeads) {
      const survey = findSurveyForLead(lead, byEmail, byPhone);
      if (survey && Object.keys(survey.answers).length > 0) {
        matchedSurveys.push(survey);
      }
    }
  }

  // 4c. Build UTM breakdown from finalLeads (shows which campaigns/adsets/ads generated these survey responses)
  const utmCampMap = new Map<string, number>();
  const utmAdsetMap = new Map<string, number>();
  const utmAdMap = new Map<string, number>();
  for (const lead of (answerFilter ? finalLeads : filteredLeads)) {
    const survey = findSurveyForLead(lead, byEmail, byPhone);
    if (!survey) continue;
    const camp = normUtm(lead.utmTerm);
    const adset = normUtm(lead.utmMedium);
    const ad = normUtm(lead.utmContent);
    if (camp) utmCampMap.set(camp, (utmCampMap.get(camp) || 0) + 1);
    if (adset) utmAdsetMap.set(adset, (utmAdsetMap.get(adset) || 0) + 1);
    if (ad) utmAdMap.set(ad, (utmAdMap.get(ad) || 0) + 1);
  }

  function buildUtmList(map: Map<string, number>): UtmBreakdownItem[] {
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0 }))
      .sort((a, b) => b.count - a.count);
  }

  const utmBreakdown: SurveyUtmBreakdown = {
    campaigns: buildUtmList(utmCampMap),
    adsets: buildUtmList(utmAdsetMap),
    ads: buildUtmList(utmAdMap),
  };

`;

agg = agg.replace(anchor5, answerFilterLogic + anchor5);

// 1e. Update the return statement to include utmBreakdown
agg = agg.replace(
  '  return { questions, totalResponses: matchedSurveys.length };\n}',
  '  return { questions, totalResponses: matchedSurveys.length, utmBreakdown };\n}'
);

fs.writeFileSync(aggPath, agg, 'utf8');
console.log('OK 1/3 - score-aggregator.ts: Added answerFilter + UTM breakdown');


// ============================================================
// PART 2: Router - Add answerFilter input to surveyBreakdown endpoint
// ============================================================
const routerPath = '/opt/meta-ads-dashboard/server/routers.ts';
let router = fs.readFileSync(routerPath, 'utf8');

// Add answerFilter to input schema
router = router.replace(
  `      ads: z.array(z.string()).optional(),
    }))
    .query(async ({ input, ctx }) => {
        const projectKey = input.project || (ctx as any).projectKey;
        if (!projectKey) return { questions: [], totalResponses: 0 };`,
  `      ads: z.array(z.string()).optional(),
      answerFilter: z.object({ question: z.string(), answer: z.string() }).optional(),
    }))
    .query(async ({ input, ctx }) => {
        const projectKey = input.project || (ctx as any).projectKey;
        if (!projectKey) return { questions: [], totalResponses: 0 };`
);

// Pass answerFilter to getSurveyBreakdown
router = router.replace(
  `        return getSurveyBreakdown(
          sheetsConfig,
          { since: input.since, until: input.until },
          {
            campaigns: input.campaigns,
            adsets: input.adsets,
            ads: input.ads,
          },
        );`,
  `        return getSurveyBreakdown(
          sheetsConfig,
          { since: input.since, until: input.until },
          {
            campaigns: input.campaigns,
            adsets: input.adsets,
            ads: input.ads,
          },
          input.answerFilter,
        );`
);

fs.writeFileSync(routerPath, router, 'utf8');
console.log('OK 2/3 - routers.ts: Added answerFilter input');


// ============================================================
// PART 3: Frontend - Interactive donut click + UTM breakdown panel
// ============================================================
const funilPath = '/opt/meta-ads-dashboard/client/src/pages/Funil.tsx';
let funil = fs.readFileSync(funilPath, 'utf8');

// 3a. Add surveyAnswerFilter state after selectedAdsets
funil = funil.replace(
  '  const [selectedAdsets, setSelectedAdsets] = useState<Set<string>>(new Set());',
  `  const [selectedAdsets, setSelectedAdsets] = useState<Set<string>>(new Set());
  const [surveyAnswerFilter, setSurveyAnswerFilter] = useState<{ question: string; answer: string } | undefined>();`
);

// 3b. Update surveyBreakdownQuery to include answerFilter
funil = funil.replace(
  `  const surveyBreakdownQuery = trpc.meta.surveyBreakdown.useQuery(
    {
      project: projectKey || "",
      since: scoreSince,
      until: scoreUntil,
      campaigns: selectedCampaigns.size > 0 ? Array.from(selectedCampaigns) : undefined,
      adsets: selectedAdsets.size > 0 ? Array.from(selectedAdsets) : undefined,
    },
    { enabled: !!projectKey },
  );`,
  `  const surveyBreakdownQuery = trpc.meta.surveyBreakdown.useQuery(
    {
      project: projectKey || "",
      since: scoreSince,
      until: scoreUntil,
      campaigns: selectedCampaigns.size > 0 ? Array.from(selectedCampaigns) : undefined,
      adsets: selectedAdsets.size > 0 ? Array.from(selectedAdsets) : undefined,
      answerFilter: surveyAnswerFilter,
    },
    { enabled: !!projectKey },
  );`
);

// 3c. Replace the entire Section 8 donut charts with interactive version + UTM breakdown
const oldSection8 = `        {/* SECTION 8: PESQUISA DE LEADS - DONUT CHARTS */}
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
              {(selectedCampaigns.size > 0 || selectedAdsets.size > 0) && (
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
        )}`;

const newSection8 = `        {/* SECTION 8: PESQUISA DE LEADS - DONUT CHARTS (Interactive Cross-Filter) */}
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
              <div className="flex items-center gap-2">
                {surveyAnswerFilter && (
                  <Badge variant="default" className="text-xs bg-primary/20 text-primary border-primary/30 cursor-pointer hover:bg-primary/30 flex items-center gap-1" onClick={() => setSurveyAnswerFilter(undefined)}>
                    {surveyAnswerFilter.answer} <span className="ml-1 font-bold">✕</span>
                  </Badge>
                )}
                {(selectedCampaigns.size > 0 || selectedAdsets.size > 0) && (
                  <Badge variant="outline" className="text-xs text-primary border-primary/30">
                    Filtrado por selecao
                  </Badge>
                )}
              </div>
            </div>

            {/* Donut Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surveyBreakdown.questions.map((q: any, idx: number) => (
                <Card key={idx} className={"bg-card border-border/50 transition-all " + (surveyAnswerFilter?.question === q.question ? "ring-2 ring-primary/50" : "")}>
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-sm font-medium truncate" title={q.question}>{q.question}</CardTitle>
                    <p className="text-[10px] text-muted-foreground">{q.total} respostas {surveyAnswerFilter?.question === q.question && <span className="text-primary">(filtrado: {surveyAnswerFilter.answer})</span>}</p>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={q.distribution.slice(0, 10)}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={80}
                          paddingAngle={2}
                          dataKey="count" nameKey="answer"
                          stroke="none"
                          style={{ cursor: "pointer" }}
                          onClick={(entry: any) => {
                            if (surveyAnswerFilter?.question === q.question && surveyAnswerFilter?.answer === entry.answer) {
                              setSurveyAnswerFilter(undefined);
                            } else {
                              setSurveyAnswerFilter({ question: q.question, answer: entry.answer });
                            }
                          }}
                        >
                          {q.distribution.slice(0, 10).map((d: any, i: number) => (
                            <Cell
                              key={i}
                              fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                              opacity={surveyAnswerFilter && surveyAnswerFilter.question === q.question && surveyAnswerFilter.answer !== d.answer ? 0.3 : 1}
                              stroke={surveyAnswerFilter?.answer === d.answer && surveyAnswerFilter?.question === q.question ? "#fff" : "none"}
                              strokeWidth={surveyAnswerFilter?.answer === d.answer && surveyAnswerFilter?.question === q.question ? 2 : 0}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number, name: string) => [v + " (" + q.distribution.find((d: any) => d.answer === name)?.pct + "%)", name]} />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", color: "#a1a1aa", cursor: "pointer" }} layout="vertical" align="right" verticalAlign="middle" onClick={(e: any) => {
                          const answer = e.value;
                          if (surveyAnswerFilter?.question === q.question && surveyAnswerFilter?.answer === answer) {
                            setSurveyAnswerFilter(undefined);
                          } else {
                            setSurveyAnswerFilter({ question: q.question, answer });
                          }
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* UTM Breakdown Panel - appears when answerFilter is active */}
            {surveyAnswerFilter && surveyBreakdown.utmBreakdown && (
              <div className="mt-4 bg-card/50 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-primary">Origem dos leads: "{surveyAnswerFilter.answer}"</h4>
                    <p className="text-[10px] text-muted-foreground">De qual campanha, conjunto e criativo vieram esses leads</p>
                  </div>
                  <button onClick={() => setSurveyAnswerFilter(undefined)} className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded border border-border/50 hover:border-primary/30">
                    Limpar filtro
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Campaigns */}
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Campanhas</h5>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {surveyBreakdown.utmBreakdown.campaigns.slice(0, 15).map((c: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-background/50 hover:bg-background/80 cursor-pointer" onClick={() => { setSelectedCampaigns(new Set([c.name])); setSelectedAdsets(new Set()); }}>
                          <span className="truncate flex-1 mr-2" title={c.name}>{c.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-muted-foreground">{c.count}</span>
                            <span className="text-primary font-medium w-12 text-right">{c.pct}%</span>
                          </div>
                        </div>
                      ))}
                      {surveyBreakdown.utmBreakdown.campaigns.length === 0 && <p className="text-[10px] text-muted-foreground">Sem dados</p>}
                    </div>
                  </div>
                  {/* Adsets */}
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Conjuntos</h5>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {surveyBreakdown.utmBreakdown.adsets.slice(0, 15).map((a: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-background/50 hover:bg-background/80 cursor-pointer" onClick={() => { setSelectedAdsets(new Set([a.name])); }}>
                          <span className="truncate flex-1 mr-2" title={a.name}>{a.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-muted-foreground">{a.count}</span>
                            <span className="text-primary font-medium w-12 text-right">{a.pct}%</span>
                          </div>
                        </div>
                      ))}
                      {surveyBreakdown.utmBreakdown.adsets.length === 0 && <p className="text-[10px] text-muted-foreground">Sem dados</p>}
                    </div>
                  </div>
                  {/* Ads */}
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Criativos</h5>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {surveyBreakdown.utmBreakdown.ads.slice(0, 15).map((a: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-background/50 hover:bg-background/80">
                          <span className="truncate flex-1 mr-2" title={a.name}>{a.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-muted-foreground">{a.count}</span>
                            <span className="text-primary font-medium w-12 text-right">{a.pct}%</span>
                          </div>
                        </div>
                      ))}
                      {surveyBreakdown.utmBreakdown.ads.length === 0 && <p className="text-[10px] text-muted-foreground">Sem dados</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Section>
        )}`;

if (funil.includes(oldSection8)) {
  funil = funil.replace(oldSection8, newSection8);
  console.log('OK 3/3 - Funil.tsx: Replaced Section 8 with interactive cross-filter');
} else {
  console.log('ERROR: Could not find old Section 8 to replace');
  // Try to find partial match
  const partial = '{/* SECTION 8: PESQUISA DE LEADS - DONUT CHARTS */}';
  if (funil.includes(partial)) {
    console.log('Found partial anchor at:', funil.indexOf(partial));
  } else {
    console.log('No partial anchor found either');
  }
}

// 3d. Clear surveyAnswerFilter when date/campaign changes
funil = funil.replace(
  '    setSelectedCampaigns(new Set());\n    setSelectedAdsets(new Set());\n  };',
  '    setSelectedCampaigns(new Set());\n    setSelectedAdsets(new Set());\n    setSurveyAnswerFilter(undefined);\n  };'
);

fs.writeFileSync(funilPath, funil, 'utf8');
console.log('\\nAll patches applied!');
