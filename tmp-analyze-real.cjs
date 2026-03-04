const data = JSON.parse(require("fs").readFileSync("/tmp/ls-real.json", "utf8"));
const r = data.result.data.json;

// Find AGV_MAR campaigns
console.log("=== CAMPAIGNS WITH AGV_MAR ===");
const camps = r.janCampaignScores || [];
const agvCamps = camps.filter(c => c.campaignName.includes("AGV_MAR"));
for (const c of agvCamps) {
  console.log(c.campaignName);
  console.log("  totalLeads:", c.totalLeads, "| surveyed:", c.surveyedLeads, "| avgScore:", c.avgScore, "| grade:", c.mqlGrade, "| convRate:", c.expectedConvRate);
}

// Check scoped breakdown for AGV_MAR campaigns
console.log("\n=== SCOPED ADSETS BY AGV_MAR CAMPAIGNS ===");
const sb = r.scopedBreakdown;
for (const c of agvCamps) {
  const adsets = sb.adsetsByCampaign[c.campaignName];
  if (adsets && adsets.length > 0) {
    console.log("\nCampaign:", c.campaignName);
    console.log("  Campaign score:", c.avgScore, "| leads:", c.totalLeads, "| surveyed:", c.surveyedLeads);
    let totalScopedLeads = 0;
    let totalScopedSurveyed = 0;
    let weightedScoreSum = 0;
    for (const a of adsets) {
      console.log("  -> Adset:", a.name.substring(0, 60), "| leads:", a.totalLeads, "| surveyed:", a.surveyedLeads, "| score:", a.avgScore);
      totalScopedLeads += a.totalLeads;
      totalScopedSurveyed += a.surveyedLeads;
      weightedScoreSum += a.avgScore * a.surveyedLeads;
    }
    const weightedAvg = totalScopedSurveyed > 0 ? (weightedScoreSum / totalScopedSurveyed).toFixed(2) : 0;
    console.log("  SCOPED TOTALS: leads:", totalScopedLeads, "| surveyed:", totalScopedSurveyed, "| weighted avg score:", weightedAvg);
    console.log("  VS CAMPAIGN:    leads:", c.totalLeads, "| surveyed:", c.surveyedLeads, "| score:", c.avgScore);
    console.log("  MATCH?", totalScopedLeads === c.totalLeads ? "YES" : "NO (" + totalScopedLeads + " vs " + c.totalLeads + ")");
  }
}

// Check flat adset scores for comparison
console.log("\n=== FLAT ADSET SCORES (first 10) ===");
const adsets = r.janAdsetScores || [];
for (const a of adsets.slice(0, 10)) {
  console.log(a.name.substring(0, 60), "| leads:", a.totalLeads, "| surveyed:", a.surveyedLeads, "| score:", a.avgScore);
}

console.log("\nticket:", r.ticket);
