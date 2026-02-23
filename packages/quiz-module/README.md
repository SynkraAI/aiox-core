# Quiz Module (Lovable Integration)

Quiz application generated via Lovable AI, integrated into AIOS. Discovers the user's archetype (comunicador, mentor, construtor, estrategista) through an interactive questionnaire with lead capture and Supabase persistence.

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase credentials
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev` (runs on port 3100)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key |

## Supabase Setup

The quiz requires a `quiz_responses` table. Apply the migration:

```bash
# Using Supabase CLI
supabase db push

# Or run the SQL manually from:
# supabase/migrations/20260223001216_e6c36a52-692b-4639-aad7-7810e159a1ed.sql
```

The migration creates:
- `quiz_responses` table with RLS enabled
- Anonymous insert/select policies (quiz is public)
- Email+date index for dedup lookups
- `updated_at` auto-trigger

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3100 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run tests (vitest) |

## Architecture

- **Framework**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui components + Tailwind CSS
- **Data**: Supabase (quiz_responses table)
- **State**: useReducer-based quiz flow (useQuizReducer)
- **Port**: 3100 (avoids conflict with main AIOS dev server)

### Key Directories

```
src/
  components/
    quiz/         # Quiz-specific screens (Entry, Question, Loading, Result)
    ui/           # shadcn/ui component library
  data/           # Quiz questions and archetype definitions
  hooks/          # useQuizReducer, use-mobile, use-toast
  integrations/   # Supabase client and types
  lib/            # Utilities (archetype-calculator, validation, cn)
  pages/          # Index (main quiz page), NotFound
  types/          # TypeScript type definitions
supabase/
  migrations/     # Database migration SQL
```

### Quiz Flow

1. **EntryScreen** - Lead capture (name, email, optional WhatsApp)
2. **QuestionScreen** - 8 questions with 4 options each (mapped to archetypes)
3. **LoadingScreen** - Brief animated transition
4. **ResultScreen** - Archetype result with description and WhatsApp CTA

### Deduplication

On entry submission, the app checks if the user (by email) already took the quiz today. If so, it skips directly to the result screen showing their existing archetype.

## Origin

Generated with Lovable AI (https://lovable.dev), exported and integrated into aios-core as part of Story LOV-1.
