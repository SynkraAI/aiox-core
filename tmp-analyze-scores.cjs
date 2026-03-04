const data = JSON.parse(require("fs").readFileSync("/tmp/ls-data.json", "utf8"));
const r = data.result && data.result.data;
if (!r) { console.log("No data", JSON.stringify(data).substring(0, 500)); process.exit(); }

console.log("=== CAMPAIGN SCORES ===");
const camps = r.janCampaignScores || [];
for (const c of camps) {
  console.log(c.campaignName.substring(0, 80));
  console.log("  totalLeads:", c.totalLeads, "| surveyed:", c.surveyedLeads, "| avgScore:", c.avgScore, "| convRate:", c.expectedConvRate, "| grade:", c.mqlGrade);
}

console.log("\n=== ADSET SCORES ===");
const adsets = r.janAdsetScores || [];
for (const a of adsets) {
  console.log(a.name.substring(0, 80));
  console.log("  totalLeads:", a.totalLeads, "| surveyed:", a.surveyedLeads, "| avgScore:", a.avgScore, "| grade:", a.mqlGrade);
  if (a.parentCampaigns && a.parentCampaigns.length) {
    console.log("  parentCampaigns:", a.parentCampaigns.join(", ").substring(0, 100));
  }
}

console.log("\n=== AD SCORES (first 15) ===");
const ads = r.janAdScores || [];
for (const a of ads.slice(0, 15)) {
  console.log(a.name.substring(0, 80));
  console.log("  totalLeads:", a.totalLeads, "| surveyed:", a.surveyedLeads, "| avgScore:", a.avgScore);
  if (a.parentAdsets && a.parentAdsets.length) {
    console.log("  parentAdsets:", a.parentAdsets.join(", ").substring(0, 100));
  }
}

// Check ticket value
console.log("\n=== PARAMS ===");
console.log("ticket:", r.ticket);
console.log("totalLeads:", r.totalLeads);
console.log("totalSurveyed:", r.totalSurveyed);
