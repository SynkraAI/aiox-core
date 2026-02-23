# Lovable Implementation Guide

**Purpose:** Step-by-step instructions for what to do after Lovable generates the quiz code.

---

## Step 1: Generate Code in Lovable

1. Open Lovable editor
2. Paste the entire contents of `LOVABLE-MEGA-PROMPT.md` (everything below the horizontal rule)
3. Wait for Lovable to generate the full application
4. Preview in Lovable's built-in preview -- check all 10 screens render
5. If screens are missing or broken, ask Lovable to fix specific issues (see `LOVABLE-EXPORT-CHECKLIST.md` for what to check)

## Step 2: Review in Lovable Preview

Before exporting, verify in Lovable's preview:

- [ ] Entry form renders with 3 inputs and amber CTA
- [ ] Tapping CTA with valid data advances to Q1
- [ ] All 7 questions display with correct text and 4 options each
- [ ] Option tap highlights the card and auto-advances
- [ ] Progress bar fills incrementally
- [ ] Loading screen shows 3 staggered text lines
- [ ] Result screen shows archetype name, description, strengths, next step
- [ ] WhatsApp button is green
- [ ] Dark theme throughout (#0F0F0F background)
- [ ] Mobile preview looks correct at 375px width

## Step 3: Export from Lovable

**Option A: GitHub Export (Recommended)**

1. In Lovable, click "Export to GitHub"
2. Connect your GitHub account if not already connected
3. Create a new repository OR push to a branch on existing repo
4. Recommended branch name: `feat/lovable-cria-quiz`

**Option B: Download ZIP**

1. In Lovable, click "Download" or "Export"
2. Download the ZIP file
3. Extract to a local directory

## Step 4: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a project (or use existing)

2. Run the database schema. Go to SQL Editor in Supabase dashboard and execute the contents of:
   ```
   docs/architecture/lovable-cria/database-schema.sql
   ```
   This creates the `quiz_responses`, `quiz_archetypes`, and `quiz_events` tables with RLS policies.

3. Copy your project credentials:
   - Project URL: `Settings > API > Project URL`
   - Anon Key: `Settings > API > Project API keys > anon public`

## Step 5: Configure Environment Variables

Create a `.env` file in the quiz project root:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

IMPORTANT: Never commit the `.env` file. Add it to `.gitignore`.

## Step 6: Place Files in aios-core (Monorepo Integration)

If integrating into the aios-core monorepo:

```
packages/quiz-module/
  src/                    (generated code from Lovable)
  public/
  package.json
  tsconfig.json
  tailwind.config.js
  vite.config.ts
  .env.example            (with placeholder values)
  .gitignore
```

Steps:
1. Copy the exported Lovable code into `packages/quiz-module/`
2. Verify `package.json` has correct dependencies:
   - `react`, `react-dom`
   - `@supabase/supabase-js`
   - `tailwindcss`, `postcss`, `autoprefixer`
3. Run `npm install` in the quiz-module directory
4. Verify it builds: `npm run build`

## Step 7: Post-Export Adjustments

Lovable may not generate everything perfectly. Common adjustments:

1. **Scoring matrix**: Verify `archetype-calculator.ts` uses the exact scoring matrix from the mega-prompt. If Lovable invented its own scoring, replace it.

2. **Supabase client**: Ensure `lib/supabase.ts` uses `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

3. **WhatsApp deep link**: Update the phone number in the WhatsApp URL to the actual business number.

4. **Archetype copy**: Cross-reference all archetype descriptions, strengths, business models, and next steps against the copy in the mega-prompt. Lovable sometimes paraphrases.

5. **Inter font**: Ensure `index.html` has the Google Fonts link:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
   ```

6. **Tailwind config**: Verify the custom color tokens (`cria-*`, `archetype-*`) are in `tailwind.config.js`.

## Step 8: Test Locally

```bash
cd packages/quiz-module
npm install
npm run dev
```

Test the full flow:
1. Fill entry form with test data
2. Answer all 7 questions
3. Verify loading animation plays
4. Verify correct archetype displays
5. Check Supabase dashboard -- confirm `quiz_responses` row was created
6. Test on mobile viewport (Chrome DevTools, 375px width)
7. Test with empty/invalid form data to verify validation

## Step 9: Deploy

Deployment options:
- **Vercel**: Connect GitHub repo, auto-deploys on push. Add env vars in Vercel dashboard.
- **Netlify**: Same approach as Vercel.
- **Supabase Hosting**: If using Supabase edge, can host there.
- **Custom domain**: Point `quiz.metodocria.com` to the deployed URL.

---

## Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18+ | UI framework |
| react-dom | 18+ | DOM rendering |
| @supabase/supabase-js | 2+ | Database client |
| tailwindcss | 3+ | Styling |
| typescript | 5+ | Type safety |
| vite | 5+ | Build tool |

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |

---

*Implementation Guide | Metodo Cria Quiz | LOV-1 Phase 5*
