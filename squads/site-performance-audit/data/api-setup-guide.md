# API Setup Guide

## Required: Google PageSpeed Insights + CrUX API

Both PSI and CrUX use the same Google Cloud API key.

### Step-by-step:

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com

2. **Create or select a project**
   - Click "Select a project" → "New Project"
   - Name: "site-performance-audit" (or any name)

3. **Enable the APIs**
   - Go to "APIs & Services" → "Library"
   - Search "PageSpeed Insights API" → Enable
   - The CrUX API is automatically available with the same key

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the key

5. **Add to project `.env` file** (recommended)
   ```bash
   # In the project root .env file (already gitignored):
   GOOGLE_PSI_API_KEY=your_key_here
   ```
   Or as environment variable:
   ```bash
   export GOOGLE_PSI_API_KEY=your_key_here
   ```

### Quotas (Free):
- **PSI:** 25,000 requests/day (400 per 100 seconds)
- **CrUX:** 150 requests/minute

### Cost: FREE (no credit card required)

---

## Optional: WebPageTest API

Used for deep-dive diagnostics only (waterfall, filmstrip).

### Step-by-step:

1. **Go to WebPageTest**
   - https://www.webpagetest.org/signup

2. **Create free account**
   - Sign up with email or GitHub

3. **Get API Key**
   - Dashboard → API Key section
   - Copy the key

4. **Add to project `.env` file** (recommended)
   ```bash
   # In the project root .env file (already gitignored):
   WPT_API_KEY=your_key_here
   ```
   Or as environment variable:
   ```bash
   export WPT_API_KEY=your_key_here
   ```

### Quotas (Free):
- **300 tests/month** (no daily limit)
- All features included (waterfall, filmstrip, Lighthouse, video)

### Cost: FREE (no credit card required)
### Paid: $15/month for 1,000 tests if needed

---

## Optional: GTmetrix PRO

NOT required for this squad. Only add if you want an extra data source.

### Cost: From $10.67/month
### Free tier: 5 tests/month, 0 API credits (insufficient for automation)

---

## Verification

After setting up, verify with:

```bash
# Load keys from .env first
source .env

# Test PSI API
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.google.com&strategy=mobile&key=$GOOGLE_PSI_API_KEY" | head -5

# Test CrUX API
curl -s -X POST "https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=$GOOGLE_PSI_API_KEY" -H "Content-Type: application/json" -d '{"origin": "https://www.google.com"}' | head -5

# Test WPT API (optional)
curl -s "https://www.webpagetest.org/getLocations.php?k=$WPT_API_KEY&f=json" | head -5
```

If all return JSON data, you're ready to audit.
