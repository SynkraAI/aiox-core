const data = JSON.parse(require("fs").readFileSync("/tmp/ls-data.json", "utf8"));
const r = data.result.data.json;

console.log("=== CAMPAIGN SCORES ===");
const camps = r.janCampaignScores || [];
for (const c of camps) {
  console.log(c.campaignName);
  console.log("  totalLeads:", c.totalLeads, "| surveyed:", c.surveyedLeads, "| avgScore:", c.avgScore, "| convRate:", c.expectedConvRate, "| grade:", c.mqlGrade);
}

console.log("\n=== ADSET SCORES ===");
const adsets = r.janAdsetScores || [];
for (const a of adsets) {
  console.log(a.name);
  console.log("  totalLeads:", a.totalLeads, "| surveyed:", a.surveyedLeads, "| avgScore:", a.avgScore, "| grade:", a.mqlGrade);
  if (a.parentCampaigns && a.parentCampaigns.length) {
    console.log("  parentCampaigns:", a.parentCampaigns.join(", "));
  }
}

console.log("\n=== AD SCORES (first 20) ===");
const ads = r.janAdScores || [];
for (const a of ads.slice(0, 20)) {
  console.log(a.name);
  console.log("  totalLeads:", a.totalLeads, "| surveyed:", a.surveyedLeads, "| avgScore:", a.avgScore);
  if (a.parentAdsets && a.parentAdsets.length) {
    console.log("  parentAdsets:", a.parentAdsets.join(", "));
  }
}

console.log("\n=== PARAMS ===");
console.log("ticket:", r.ticket);

console.log("\n=== SCOPED BREAKDOWN (campaign->adset, first 3) ===");
if (r.scopedBreakdown) {
  const sb = r.scopedBreakdown;
  if (sb.campaignAdsets) {
    const entries = Object.entries(sb.campaignAdsets);
    for (const [camp, adsets] of entries.slice(0, 3)) {
      console.log("Campaign:", camp);
      for (const a of adsets) {
        console.log("  -> Adset:", a.name, "| leads:", a.totalLeads, "| surveyed:", a.surveyedLeads, "| score:", a.avgScore);
      }
    }
  }
}
