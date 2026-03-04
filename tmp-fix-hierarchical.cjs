const fs = require('fs');

// ============================================================
// STEP 1: Clean up debug code from score-aggregator.ts
// ============================================================
const aggPath = '/opt/meta-ads-dashboard/server/services/score-aggregator.ts';
let agg = fs.readFileSync(aggPath, 'utf8');

// Remove DEBUG-PM lines
agg = agg.replace(/  console\.log\('\[DEBUG-PM\].*\n/g, '');
// Remove SCOPED-DEBUG lines
agg = agg.replace(/  \/\/ DEBUG: Log scoped data sizes\n(  console\.log\('\[SCOPED-DEBUG\].*\n)*/g, '');

fs.writeFileSync(aggPath, agg, 'utf8');
console.log('1/4 OK - Cleaned score-aggregator.ts debug code');


// ============================================================
// STEP 2: Clean up debug code from routers.ts + enrich scopedBreakdown
// ============================================================
const routerPath = '/opt/meta-ads-dashboard/server/routers.ts';
let router = fs.readFileSync(routerPath, 'utf8');

// Remove debug lines
router = router.replace(/              process\.stderr\.write\("\[ROUTER-DEBUG\].*\n/g, '');
router = router.replace(/              console\.log\("\[ROUTER-DEBUG\].*\n/g, '');
router = router.replace(/        process\.stderr\.write\("\[LEADSCORE-ENTRY\].*\n/g, '');
router = router.replace(` /* DEBUG-MARK */`, '');

// Now enrich the scopedBreakdown data with MQL info
// Find where scopedBreakdown is set in the return object
const scopedReturnAnchor = `                scopedBreakdown: aggregated.scopedBreakdown || { adsetsByCampaign: {}, adsByAdset: {}, adsByCampaign: {} },`;

const enrichedScopedReturn = `                scopedBreakdown: (() => {
                  const sb = aggregated.scopedBreakdown || { adsetsByCampaign: {}, adsByAdset: {}, adsByCampaign: {} };
                  // Enrich scoped entries with MQL data for frontend consumption
                  function enrichScoped(entries: Record<string, any[]>): Record<string, any[]> {
                    const result: Record<string, any[]> = {};
                    for (const [key, items] of Object.entries(entries)) {
                      result[key] = items.map((s: any) => ({
                        ...s,
                        mqlGrade: scoreToGrade(s.avgScore),
                        expectedConvRate: scoreToExpectedConvRate(s.avgScore),
                        acceptableCPL: calculateAcceptableCPL(scoreToExpectedConvRate(s.avgScore)),
                        mqlDistribution: estimateDistribution(s.avgScore, s.surveyedLeads),
                        surveyRate: s.totalLeads > 0 ? (s.surveyedLeads / s.totalLeads) * 100 : 0,
                        buyers: 0,
                        realConvRate: scoreToExpectedConvRate(s.avgScore),
                      }));
                    }
                    return result;
                  }
                  return {
                    adsetsByCampaign: enrichScoped(sb.adsetsByCampaign),
                    adsByAdset: enrichScoped(sb.adsByAdset),
                    adsByCampaign: enrichScoped(sb.adsByCampaign),
                  };
                })(),`;

if (router.includes(scopedReturnAnchor)) {
  router = router.replace(scopedReturnAnchor, enrichedScopedReturn);
  console.log('2/4 OK - Enriched scopedBreakdown in routers.ts');
} else {
  console.log('2/4 ERROR: scopedReturnAnchor not found');
  // Show what we have
  const idx = router.indexOf('scopedBreakdown');
  if (idx > -1) {
    console.log('  Found scopedBreakdown at:', idx);
    console.log('  Context:', router.substring(idx, idx + 200));
  }
}

fs.writeFileSync(routerPath, router, 'utf8');


// ============================================================
// STEP 3: Update Home.tsx frontend — use scoped data
// ============================================================
const homePath = '/opt/meta-ads-dashboard/client/src/pages/Home.tsx';
let home = fs.readFileSync(homePath, 'utf8');

// 3a. Add scopedBreakdown memo after adScoreMap
const adScoreMapEnd = `  }, [leadScoring]);

  // Match campaign name → campaign score`;

const scopedMemo = `  }, [leadScoring]);

  // Scoped breakdown: hierarchical scores (campaign→adset, adset→ad)
  const scopedBreakdown = useMemo(() => {
    return leadScoring?.scopedBreakdown || { adsetsByCampaign: {}, adsByAdset: {}, adsByCampaign: {} };
  }, [leadScoring]);

  // Get scoped adset score within a specific campaign context
  const getScopedAdsetScore = (adsetName: string, campaignName: string) => {
    // Find the campaign's UTM key from leadScoreMap
    const campLS = getLeadScoreForCampaign(campaignName);
    if (!campLS) return null;
    const campUtmKey = campLS.campaignName;
    const scopedAdsets = scopedBreakdown.adsetsByCampaign?.[campUtmKey];
    if (!scopedAdsets || scopedAdsets.length === 0) return null;

    // Try exact match first
    const normAdset = normalizeScoreName(adsetName);
    let match = scopedAdsets.find((s: any) => normalizeScoreName(s.name) === normAdset);

    // Fuzzy match
    if (!match) {
      const upper = adsetName.toUpperCase().replace(/[\\s+]+/g, "_").trim();
      match = scopedAdsets.find((s: any) => {
        const key = normalizeScoreName(s.name);
        return key.includes(upper) || upper.includes(key);
      });
    }

    // If campaign has only 1 adset, use it directly
    if (!match && scopedAdsets.length === 1) {
      match = scopedAdsets[0];
    }

    return match || null;
  };

  // Get scoped ad score within a specific adset context
  const getScopedAdScore = (adName: string, adsetName: string) => {
    // Find the adset's UTM key
    const normAdset = normalizeScoreName(adsetName);
    // Try all adset keys in scopedBreakdown.adsByAdset
    let scopedAds: any[] | null = null;
    for (const [key, value] of Object.entries(scopedBreakdown.adsByAdset || {})) {
      if (normalizeScoreName(key) === normAdset) {
        scopedAds = value as any[];
        break;
      }
    }
    if (!scopedAds) {
      // Fuzzy
      const upper = adsetName.toUpperCase().replace(/[\\s+]+/g, "_").trim();
      for (const [key, value] of Object.entries(scopedBreakdown.adsByAdset || {})) {
        const normKey = normalizeScoreName(key);
        if (normKey.includes(upper) || upper.includes(normKey)) {
          scopedAds = value as any[];
          break;
        }
      }
    }
    if (!scopedAds) return null;

    // Find matching ad
    const normAd = normalizeScoreName(adName);
    let match = scopedAds.find((s: any) => normalizeScoreName(s.name) === normAd);
    if (!match) {
      const upper = adName.toUpperCase().replace(/[\\s+]+/g, "_").trim();
      match = scopedAds.find((s: any) => {
        const key = normalizeScoreName(s.name);
        return key.includes(upper) || upper.includes(key);
      });
    }
    return match || null;
  };

  // Match campaign name → campaign score`;

if (home.includes(adScoreMapEnd)) {
  home = home.replace(adScoreMapEnd, scopedMemo);
  console.log('3a/4 OK - Added scopedBreakdown memo and helpers');
} else {
  console.log('3a/4 ERROR: adScoreMapEnd not found');
}

// 3b. Replace adset table scoring to use scoped data when campaign is selected
// The adset row currently uses: const ls = getLeadScoreForAdset(a.nome || "", a.campaignName || "");
// We want: if selectedCampaign, try getScopedAdsetScore first
const adsetLSAnchor = `                            const ls = getLeadScoreForAdset(a.nome || "", a.campaignName || "");`;
const adsetLSReplacement = `                            const ls = (selectedCampaign ? getScopedAdsetScore(a.nome || "", selectedCampaign.nome || "") : null) || getLeadScoreForAdset(a.nome || "", a.campaignName || "");`;

if (home.includes(adsetLSAnchor)) {
  home = home.replace(adsetLSAnchor, adsetLSReplacement);
  console.log('3b/4 OK - Adset table now uses scoped scores');
} else {
  console.log('3b/4 ERROR: adsetLSAnchor not found');
}

// 3c. Replace ad table scoring to use scoped data when adset is selected
const adLSAnchor = `                            const ls = getLeadScoreForAd(a.nome || "", campName, a.adsetName || "");`;
const adLSReplacement = `                            const ls = (selectedAdset ? getScopedAdScore(a.nome || "", selectedAdset.nome || "") : null) || getLeadScoreForAd(a.nome || "", campName, a.adsetName || "");`;

if (home.includes(adLSAnchor)) {
  home = home.replace(adLSAnchor, adLSReplacement);
  console.log('3c/4 OK - Ad table now uses scoped scores');
} else {
  console.log('3c/4 ERROR: adLSAnchor not found');
}

fs.writeFileSync(homePath, home, 'utf8');


// ============================================================
// STEP 4: Verify
// ============================================================
const updatedHome = fs.readFileSync(homePath, 'utf8');
const updatedRouter = fs.readFileSync(routerPath, 'utf8');

const checks = [
  ['scopedBreakdown memo', updatedHome.includes('const scopedBreakdown = useMemo')],
  ['getScopedAdsetScore', updatedHome.includes('const getScopedAdsetScore')],
  ['getScopedAdScore', updatedHome.includes('const getScopedAdScore')],
  ['adset uses scoped', updatedHome.includes('selectedCampaign ? getScopedAdsetScore')],
  ['ad uses scoped', updatedHome.includes('selectedAdset ? getScopedAdScore')],
  ['enrichScoped in router', updatedRouter.includes('enrichScoped')],
  ['no DEBUG-PM', !updatedRouter.includes('LEADSCORE-ENTRY')],
  ['no ROUTER-DEBUG', !updatedRouter.includes('ROUTER-DEBUG')],
];

console.log('\n=== VERIFICATION ===');
let allOk = true;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'OK' : 'FAIL'}: ${name}`);
  if (!ok) allOk = false;
}
console.log(allOk ? '\nAll checks passed!' : '\nSome checks FAILED!');
