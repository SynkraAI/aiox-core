const data = JSON.parse(require("fs").readFileSync("/tmp/ls-data.json", "utf8"));
const r = data.result.data.json;

// Check scopedBreakdown
const sb = r.scopedBreakdown;
console.log("scopedBreakdown keys:", Object.keys(sb));

// adsetsByCampaign
const abc = sb.adsetsByCampaign;
console.log("\n=== adsetsByCampaign ===");
console.log("Number of campaigns:", Object.keys(abc).length);
for (const [camp, adsets] of Object.entries(abc).slice(0, 3)) {
  console.log("\nCampaign:", camp);
  console.log("  Adsets count:", adsets.length);
  for (const a of adsets.slice(0, 5)) {
    console.log("  -> ", a.name.substring(0, 50), "| leads:", a.totalLeads, "| surveyed:", a.surveyedLeads, "| score:", a.avgScore);
  }
}

// Show one specific campaign and its adsets sum
console.log("\n=== HIERARCHICAL CHECK: Campaign C06 ===");
const c06key = Object.keys(abc).find(k => k.includes("C06") && k.includes("adv"));
if (c06key) {
  console.log("Campaign:", c06key);
  const adsets = abc[c06key];
  let totalLeads = 0;
  let totalScoreSum = 0;
  let totalSurveyed = 0;
  for (const a of adsets) {
    console.log("  Adset:", a.name.substring(0, 50), "| leads:", a.totalLeads, "| surveyed:", a.surveyedLeads, "| score:", a.avgScore);
    totalLeads += a.totalLeads;
    totalSurveyed += a.surveyedLeads;
    totalScoreSum += a.avgScore * a.surveyedLeads;
  }
  const avgFromAdsets = totalSurveyed > 0 ? (totalScoreSum / totalSurveyed).toFixed(2) : 0;
  console.log("\n  TOTAL leads from adsets:", totalLeads);
  console.log("  TOTAL surveyed from adsets:", totalSurveyed);
  console.log("  WEIGHTED AVG score from adsets:", avgFromAdsets);

  // Compare with campaign-level
  const campScore = r.janCampaignScores.find(c => c.campaignName.includes("C06") && c.campaignName.includes("adv"));
  if (campScore) {
    console.log("\n  Campaign-level totalLeads:", campScore.totalLeads);
    console.log("  Campaign-level surveyed:", campScore.surveyedLeads);
    console.log("  Campaign-level avgScore:", campScore.avgScore);
  }
}

// Also check parentMappings
console.log("\n=== parentMappings ===");
const pm = r.parentMappings;
console.log("campaignToAdsets keys:", Object.keys(pm.campaignToAdsets || {}).length);
console.log("adsetToAds keys:", Object.keys(pm.adsetToAds || {}).length);
