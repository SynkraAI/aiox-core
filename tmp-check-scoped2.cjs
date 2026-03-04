const data = JSON.parse(require("fs").readFileSync("/tmp/ls-data3.json", "utf8"));
const r = data.result.data.json;
const sb = r.scopedBreakdown;

console.log("scopedBreakdown:", JSON.stringify(sb).substring(0, 200));
console.log("adsetsByCampaign type:", typeof sb.adsetsByCampaign);
console.log("adsetsByCampaign keys:", Object.keys(sb.adsetsByCampaign).length);
console.log("adsByAdset keys:", Object.keys(sb.adsByAdset).length);
console.log("adsByCampaign keys:", Object.keys(sb.adsByCampaign).length);

// Check if it's an empty object vs something else
console.log("adsetsByCampaign is empty?", JSON.stringify(sb.adsetsByCampaign) === '{}');
console.log("Full scopedBreakdown size:", JSON.stringify(sb).length);

// Also check parentMappings
const pm = r.parentMappings;
console.log("\nparentMappings.campaignToAdsets:", JSON.stringify(pm.campaignToAdsets).substring(0, 200));
console.log("parentMappings.adsetToAds:", JSON.stringify(pm.adsetToAds).substring(0, 200));
