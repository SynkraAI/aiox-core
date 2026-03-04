const fs = require('fs');
const aggPath = '/opt/meta-ads-dashboard/server/services/score-aggregator.ts';
let agg = fs.readFileSync(aggPath, 'utf8');

// Add debug logging to the scoped breakdown section
const anchor = `  const scopedBreakdown = {`;
const debugCode = `  // DEBUG: Log scoped data sizes
  console.log('[SCOPED-DEBUG] campAdsetAcc keys:', Object.keys(campAdsetAcc).length);
  console.log('[SCOPED-DEBUG] adsetAdAcc keys:', Object.keys(adsetAdAcc).length);
  console.log('[SCOPED-DEBUG] campAdAcc keys:', Object.keys(campAdAcc).length);
  if (Object.keys(campAdsetAcc).length > 0) {
    const firstCamp = Object.keys(campAdsetAcc)[0];
    console.log('[SCOPED-DEBUG] first camp:', firstCamp, 'adsets:', Object.keys(campAdsetAcc[firstCamp]).length);
  }
  // Check filteredLeads UTM values
  if (filteredLeads.length > 0) {
    const sample = filteredLeads[0];
    console.log('[SCOPED-DEBUG] sample lead utmTerm:', sample.utmTerm, 'utmMedium:', sample.utmMedium, 'utmContent:', sample.utmContent);
    console.log('[SCOPED-DEBUG] normUtm(utmTerm):', normUtm(sample.utmTerm));
    console.log('[SCOPED-DEBUG] normUtm(utmMedium):', normUtm(sample.utmMedium));
  }
  console.log('[SCOPED-DEBUG] filteredLeads count:', filteredLeads.length);

`;

if (agg.includes(anchor)) {
  agg = agg.replace(anchor, debugCode + anchor);
  fs.writeFileSync(aggPath, agg, 'utf8');
  console.log('OK - Debug logging added');
} else {
  console.log('ERROR: anchor not found');
}
