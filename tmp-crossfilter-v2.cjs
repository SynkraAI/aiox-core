const fs = require('fs');

// ============================================================
// PART 1: Backend — Add answerFilter to aggregateScoresFromSheets
// ============================================================
const aggPath = '/opt/meta-ads-dashboard/server/services/score-aggregator.ts';
let agg = fs.readFileSync(aggPath, 'utf8');

// 1a. Change function signature to accept answerFilter
agg = agg.replace(
  `export async function aggregateScoresFromSheets(
  config: SheetsConfig,
  dateFilter?: { since?: string; until?: string },
): Promise<SheetsAggregationResult> {`,
  `export async function aggregateScoresFromSheets(
  config: SheetsConfig,
  dateFilter?: { since?: string; until?: string },
  answerFilter?: { question: string; answer: string },
): Promise<SheetsAggregationResult> {`
);

// 1b. Find where filteredLeads is finalized (after date filter) and add survey answer filter
// The date filter block ends with a closing brace, then the code builds survey lookup
// We need to insert AFTER date filtering, BEFORE the survey lookup and scoring

// Find the pattern: after date filter, before survey lookup
// The code has: filteredLeads date filter → then buildSurveyLookup
// Look for buildSurveyLookup call in aggregateScoresFromSheets context
// Actually, let's find the exact insertion point

// In aggregateScoresFromSheets, after the date filter there's a section that does:
//   const { byEmail, byPhone } = buildSurveyLookup(allSurveys);
// We need to filter BEFORE the granular scores are built

// Find the section between date filter and granular scores
// The code flow in aggregateScoresFromSheets:
// 1. Read leads + surveys
// 2. Date filter → filteredLeads
// 3. buildSurveyLookup
// 4. buildGranularScores (campaign, adset, ad)
// We insert answer filter between 2 and 3

// The exact anchor: right before the first buildGranularScores call
// But actually we need survey lookup to do the filter. So:
// 3. buildSurveyLookup
// INSERT: answer filter on filteredLeads using survey match
// 4. buildGranularScores

const granularAnchor = `  const campaignScores = buildGranularScores(filteredLeads, byEmail, byPhone, 'utmTerm');`;

const answerFilterCode = `  // Answer filter: only include leads whose survey matches the specified answer
  if (answerFilter && answerFilter.question && answerFilter.answer) {
    filteredLeads = filteredLeads.filter(lead => {
      const survey = findSurveyForLead(lead, byEmail, byPhone);
      if (!survey) return false;
      return survey.answers[answerFilter.question] === answerFilter.answer;
    });
  }

`;

if (agg.includes(granularAnchor)) {
  agg = agg.replace(granularAnchor, answerFilterCode + granularAnchor);
  console.log('1a. Added answerFilter to aggregateScoresFromSheets');
} else {
  console.log('ERROR: granular anchor not found');
}

fs.writeFileSync(aggPath, agg, 'utf8');
console.log('OK 1/3 - score-aggregator.ts updated');


// ============================================================
// PART 2: Router — Add answerFilter input to leadScoring endpoint
// ============================================================
const routerPath = '/opt/meta-ads-dashboard/server/routers.ts';
let router = fs.readFileSync(routerPath, 'utf8');

// 2a. Change leadScoring input to accept answerFilter
router = router.replace(
  `    leadScoring: publicProcedure
      .input(z.object({ project: z.string().optional(), since: z.string().optional(), until: z.string().optional() }).optional())`,
  `    leadScoring: publicProcedure
      .input(z.object({ project: z.string().optional(), since: z.string().optional(), until: z.string().optional(), answerFilter: z.object({ question: z.string(), answer: z.string() }).optional() }).optional())`
);

// 2b. Pass answerFilter to aggregateScoresFromSheets call inside leadScoring
router = router.replace(
  `              const aggregated = await aggregateScoresFromSheets({
                leads: sheetsConfig.leads,
                surveys: sheetsConfig.surveys,
                productTag: sheetsConfig.productTag,
              }, dateFilter);`,
  `              const aggregated = await aggregateScoresFromSheets({
                leads: sheetsConfig.leads,
                surveys: sheetsConfig.surveys,
                productTag: sheetsConfig.productTag,
              }, dateFilter, input?.answerFilter);`
);

fs.writeFileSync(routerPath, router, 'utf8');
console.log('OK 2/3 - routers.ts: Added answerFilter to leadScoring');


// ============================================================
// PART 3: Frontend — Wire surveyAnswerFilter to leadScoringQuery + remove UTM panel
// ============================================================
const funilPath = '/opt/meta-ads-dashboard/client/src/pages/Funil.tsx';
let funil = fs.readFileSync(funilPath, 'utf8');

// 3a. Update leadScoringQuery to include answerFilter
funil = funil.replace(
  `  const leadScoringQuery = trpc.meta.leadScoring.useQuery(
    { project: projectKey || "", since: scoreSince, until: scoreUntil },
    { enabled: !!projectKey, staleTime: 5 * 60 * 1000 }
  );`,
  `  const leadScoringQuery = trpc.meta.leadScoring.useQuery(
    { project: projectKey || "", since: scoreSince, until: scoreUntil, answerFilter: surveyAnswerFilter },
    { enabled: !!projectKey, staleTime: 5 * 60 * 1000 }
  );`
);

// 3b. Remove the separate UTM Breakdown Panel from Section 8
// Find and remove the entire block: {/* UTM Breakdown Panel ... */} ... closing div
const utmPanelStart = `            {/* UTM Breakdown Panel - appears when answerFilter is active */}`;
const utmPanelEnd = `          </Section>`;

if (funil.includes(utmPanelStart)) {
  // Extract from utmPanelStart to just before </Section>
  const startIdx = funil.indexOf(utmPanelStart);
  const endIdx = funil.indexOf(utmPanelEnd, startIdx);

  // We want to remove from utmPanelStart to just before </Section>
  // The UTM panel block ends with a closing )}  then </Section>
  // Let's find the exact end — it's the closing of the surveyAnswerFilter && surveyBreakdown.utmBreakdown block

  // Actually, let's just remove the entire UTM panel block
  // Pattern: from "{/* UTM Breakdown Panel" to the next ")}  \n" before </Section>

  // Simpler: remove from utmPanelStart to just before </Section>
  const blockToRemove = funil.substring(startIdx, endIdx);
  funil = funil.replace(blockToRemove, '');
  console.log('3b. Removed UTM Breakdown Panel');
} else {
  console.log('3b. UTM Panel not found (already removed?)');
}

// 3c. Add active filter indicator to Section 7 (Lead Score tables)
// Find the Lead Score section header and add filter badge
const section7Title = `Lead Score por Campanha`;
if (funil.includes(section7Title)) {
  // Add a visible filter badge near the section
  // Find where the section 7 scores/respostas are shown
  const scoreHeaderPattern = `<span>Score Medio</span>`;
  // Actually let's find the filter indicator area in Section 7
  // The Section 7 header area has: score medio + respostas count
  // Let's add the filter badge after the date filters

  // Find the MQL legend area
  const mqlPattern = `MQL:`;
  // Let's just add the badge to the section header subtitle area
}

// 3d. Add filter badge to the existing Lead Score section to indicate survey filter is active
// Find the area right after Section 7 header that shows score + respostas
const scoreMedioArea = funil.indexOf('Score Medio');
const respostasArea = funil.indexOf('Respostas', scoreMedioArea > 0 ? scoreMedioArea : 0);

// Better approach: Add a visible banner above the tables when filter is active
// Find the tabs area (Campanhas | Conjuntos | Criativos)
const tabsCampsPattern = `Campanhas ({(data as any).campaigns`;

// Actually, the cleanest solution: Add a banner right inside the Lead Score section
// when surveyAnswerFilter is active

// Find the collapsible content area of Section 7
// The Section 7 contains: date filters, then a Tabs component with campaigns/adsets/ads
// Let's add a banner between date filters and the tabs

// Find exact insertion point — right before the campaign/adset/ad Tabs
const tabsDefaultValue = funil.indexOf(`<Tabs value={scoreTab}`);

if (tabsDefaultValue > -1) {
  // Find the line start
  const lineStart = funil.lastIndexOf('\n', tabsDefaultValue);
  const indent = '            ';

  const filterBanner = `
${indent}{surveyAnswerFilter && (
${indent}  <div className="mb-3 bg-primary/10 border border-primary/30 rounded-lg px-4 py-2.5 flex items-center justify-between">
${indent}    <div className="flex items-center gap-2">
${indent}      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
${indent}      <span className="text-sm font-medium text-primary">Filtrado por pesquisa:</span>
${indent}      <span className="text-sm text-foreground">{surveyAnswerFilter.answer}</span>
${indent}    </div>
${indent}    <button onClick={() => setSurveyAnswerFilter(undefined)} className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded border border-border/50 hover:border-primary/30">
${indent}      Limpar filtro
${indent}    </button>
${indent}  </div>
${indent})}
`;

  funil = funil.slice(0, lineStart) + filterBanner + funil.slice(lineStart);
  console.log('3d. Added filter banner to Lead Score section');
}

fs.writeFileSync(funilPath, funil, 'utf8');
console.log('OK 3/3 - Funil.tsx updated');

console.log('\nAll v2 cross-filter patches applied!');
