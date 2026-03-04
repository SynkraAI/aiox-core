const fs = require('fs');
const homePath = '/opt/meta-ads-dashboard/client/src/pages/Home.tsx';
let home = fs.readFileSync(homePath, 'utf8');

// The current ad table uses:
//   const ls = (selectedAdset ? getScopedAdScore(...) : null) || getLeadScoreForAd(...)
// But when only selectedCampaign is set (not selectedAdset), we should use adsByCampaign
// Need to also add a getScopedAdByCampaign function

// 1. Add getScopedAdByCampaign function after getScopedAdScore
const adScoreEndAnchor = `    return match || null;
  };

  // Match campaign name → campaign score`;

const adByCampaignFunc = `    return match || null;
  };

  // Get scoped ad score within a specific campaign context (when no adset is selected)
  const getScopedAdByCampaign = (adName: string, campaignName: string) => {
    const campLS = getLeadScoreForCampaign(campaignName);
    if (!campLS) return null;
    const campUtmKey = campLS.campaignName;
    const scopedAds = scopedBreakdown.adsByCampaign?.[campUtmKey];
    if (!scopedAds || scopedAds.length === 0) return null;

    // Try exact match
    const normAd = normalizeScoreName(adName);
    let match = scopedAds.find((s: any) => normalizeScoreName(s.name) === normAd);

    // Fuzzy match
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

if (home.includes(adScoreEndAnchor)) {
  home = home.replace(adScoreEndAnchor, adByCampaignFunc);
  console.log('1/2 OK - Added getScopedAdByCampaign function');
} else {
  console.log('1/2 ERROR: adScoreEndAnchor not found');
}

// 2. Update the ad table to use campaign-scoped data when selectedCampaign is set
const currentAdLS = `                            const ls = (selectedAdset ? getScopedAdScore(a.nome || "", selectedAdset.nome || "") : null) || getLeadScoreForAd(a.nome || "", campName, a.adsetName || "");`;
const newAdLS = `                            const ls = (selectedAdset ? getScopedAdScore(a.nome || "", selectedAdset.nome || "") : null) || (selectedCampaign ? getScopedAdByCampaign(a.nome || "", selectedCampaign.nome || "") : null) || getLeadScoreForAd(a.nome || "", campName, a.adsetName || "");`;

if (home.includes(currentAdLS)) {
  home = home.replace(currentAdLS, newAdLS);
  console.log('2/2 OK - Ad table now uses campaign-scoped data');
} else {
  console.log('2/2 ERROR: currentAdLS not found');
}

fs.writeFileSync(homePath, home, 'utf8');

// Verify
const updated = fs.readFileSync(homePath, 'utf8');
console.log('\n=== VERIFY ===');
console.log('getScopedAdByCampaign exists:', updated.includes('getScopedAdByCampaign'));
console.log('ad table uses campaign-scoped:', updated.includes('getScopedAdByCampaign(a.nome'));
