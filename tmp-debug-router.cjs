const fs = require('fs');
const routerPath = '/opt/meta-ads-dashboard/server/routers.ts';
let router = fs.readFileSync(routerPath, 'utf8');

// Add debug right after aggregateScoresFromSheets call
const anchor = `              const aggregated = await aggregateScoresFromSheets({
                leads: sheetsConfig.leads,
                surveys: sheetsConfig.surveys,
                productTag: sheetsConfig.productTag,
              }, dateFilter, input?.answerFilter);`;

const replacement = `              const aggregated = await aggregateScoresFromSheets({
                leads: sheetsConfig.leads,
                surveys: sheetsConfig.surveys,
                productTag: sheetsConfig.productTag,
              }, dateFilter, input?.answerFilter);
              console.log('[ROUTER-DEBUG] aggregated keys:', Object.keys(aggregated));
              console.log('[ROUTER-DEBUG] campaignScores:', aggregated.campaignScores?.length);
              console.log('[ROUTER-DEBUG] parentMappings:', JSON.stringify(aggregated.parentMappings || {}).substring(0, 200));
              console.log('[ROUTER-DEBUG] scopedBreakdown adsetsByCampaign keys:', Object.keys(aggregated.scopedBreakdown?.adsetsByCampaign || {}).length);`;

if (router.includes(anchor)) {
  router = router.replace(anchor, replacement);
  fs.writeFileSync(routerPath, router, 'utf8');
  console.log('OK - Router debug added');
} else {
  console.log('ERROR: anchor not found');
}
