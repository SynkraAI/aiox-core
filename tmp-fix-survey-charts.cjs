const fs = require('fs');
const funilPath = '/opt/meta-ads-dashboard/client/src/pages/Funil.tsx';
let funil = fs.readFileSync(funilPath, 'utf8');

// FIX 1: Add the useQuery hook after leadScoringQuery (line ~165)
const hookAnchor = '  const leadScoring = leadScoringQuery.data;';
const hookCode = `
  // Survey breakdown for donut charts (cross-filtered by table selections)
  const surveyBreakdownQuery = trpc.meta.surveyBreakdown.useQuery(
    {
      project: projectKey || "",
      since: scoreSince,
      until: scoreUntil,
      campaigns: selectedCampaigns.size > 0 ? Array.from(selectedCampaigns) : undefined,
      adsets: selectedAdsets.size > 0 ? Array.from(selectedAdsets) : undefined,
    },
    { enabled: !!projectKey },
  );
  const surveyBreakdown = surveyBreakdownQuery.data;`;

if (!funil.includes('surveyBreakdownQuery')) {
  funil = funil.replace(hookAnchor, hookAnchor + '\n' + hookCode);
  console.log('FIX 1: Added useQuery hook');
} else {
  console.log('FIX 1: Hook already exists');
}

// FIX 2: Remove references to selectedAds (doesn't exist as state)
funil = funil.replace(
  '{(selectedCampaigns.size > 0 || selectedAdsets.size > 0 || selectedAds.size > 0) && (',
  '{(selectedCampaigns.size > 0 || selectedAdsets.size > 0) && ('
);
console.log('FIX 2: Removed selectedAds references');

fs.writeFileSync(funilPath, funil, 'utf8');
console.log('All fixes applied!');
