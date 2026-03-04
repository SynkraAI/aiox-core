const fs = require('fs');
const aggPath = '/opt/meta-ads-dashboard/server/services/score-aggregator.ts';
let agg = fs.readFileSync(aggPath, 'utf8');

// Remove previous debug
agg = agg.replace(/  \/\/ DEBUG: Log scoped data sizes[\s\S]*?console\.log\('\[SCOPED-DEBUG\] filteredLeads count:', filteredLeads\.length\);\n\n/g, '');

// Add debug RIGHT after parentMappings is built
const parentAnchor = `  const parentMappings = {
    campaignToAdsets: Object.fromEntries(
      Object.entries(cToA).map(([k, v]) => [k, Array.from(v)])
    ),
    adsetToAds: Object.fromEntries(
      Object.entries(aToAd).map(([k, v]) => [k, Array.from(v)])
    ),
  };`;

const debugAfterParent = `  const parentMappings = {
    campaignToAdsets: Object.fromEntries(
      Object.entries(cToA).map(([k, v]) => [k, Array.from(v)])
    ),
    adsetToAds: Object.fromEntries(
      Object.entries(aToAd).map(([k, v]) => [k, Array.from(v)])
    ),
  };
  console.log('[DEBUG-PM] cToA size:', Object.keys(cToA).length);
  console.log('[DEBUG-PM] aToAd size:', Object.keys(aToAd).length);
  console.log('[DEBUG-PM] parentMappings.campaignToAdsets:', Object.keys(parentMappings.campaignToAdsets).length);
  console.log('[DEBUG-PM] filteredLeads count:', filteredLeads.length);
  if (filteredLeads.length > 0) {
    const s = filteredLeads[0];
    console.log('[DEBUG-PM] sample lead UTMs:', s.utmTerm, '|', s.utmMedium, '|', s.utmContent);
  }`;

if (agg.includes(parentAnchor)) {
  agg = agg.replace(parentAnchor, debugAfterParent);
  console.log('OK - Parent mappings debug added');
} else {
  console.log('ERROR: parent anchor not found. Looking for variations...');
  // Try to find it
  const idx = agg.indexOf('const parentMappings');
  console.log('Found parentMappings at index:', idx);
  if (idx > -1) {
    console.log('Context:', agg.substring(idx, idx + 200));
  }
}

fs.writeFileSync(aggPath, agg, 'utf8');
