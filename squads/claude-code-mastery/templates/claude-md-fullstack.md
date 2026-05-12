# CLAUDE.md — Fullstack Project (Next.js + React)

## Project Overview

- **Name:** [PROJECT_NAME]
- **Description:** [Brief description of the application]
- **Type:** Fullstack web application
- **Framework:** Next.js (App Router)
- **Status:** [Development / Staging / Production]

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 15.x |
| UI Library | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui | latest |
| State (client) | Zustand | 5.x |
| Data Fetching | TanStack Query | 5.x |
| Database | PostgreSQL | via Supabase |
| Auth | Supabase Auth | — |
| Validation | Zod | 3.x |
| Testing | Jest + React Testing Library | — |
| Linting | ESLint + Prettier | — |

## Directory Structure

```
src/
  app/                    # Next.js App Router pages
    (auth)/               # Auth route group (login, register)
    (dashboard)/          # Dashboard route group
    api/                  # API route handlers
    layout.tsx            # Root layout
    page.tsx              # Landing page
  components/
    ui/                   # shadcn/ui base components
    shared/               # Shared composite components
    features/             # Feature-specific components
  lib/
    supabase/             # Supabase client configuration
    utils.ts              # Utility functions
    constants.ts          # Application constants
  hooks/                  # Custom React hooks
  stores/                 # Zustand stores
  types/                  # TypeScript type definitions
  styles/                 # Global styles, Tailwind config
```

## Code Standards

### Components
- Use function components with TypeScript interfaces for props
- Prefer named exports: `export function Button() {}` not `export default`
- Co-locate component tests: `Button.tsx` + `Button.test.tsx`
- Separate server components (default) from client components (`'use client'`)
- Keep components under 200 lines; extract logic into hooks

### Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase with descriptive suffixes (`UserProfileProps`, `AuthState`)
- API routes: lowercase with hyphens (`/api/user-profile/route.ts`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)

### Server vs Client Components
- **Server Components** (default): Data fetching, database access, sensitive logic
- **Client Components** (`'use client'`): Interactivity, browser APIs, state, effects
- Never import server-only modules in client components
- Pass serializable props from server to client components

### API Patterns
- API routes in `src/app/api/` using Route Handlers
- Validate all inputs with Zod schemas
- Return consistent response shapes: `{ data, error, meta }`
- Use proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Handle errors with try/catch, never expose internal errors

### State Management
- **Server state:** TanStack Query for all API data (caching, revalidation)
- **Client state:** Zustand for UI state (modals, sidebars, preferences)
- **Form state:** React Hook Form + Zod validation
- Never duplicate server state in client stores

## Testing Requirements

- Run all tests: `npm test`
- Run with coverage: `npm test -- --coverage`
- Minimum coverage: 80% for business logic, 60% for components
- Test files: `*.test.ts` or `*.test.tsx` co-located with source
- Use `@testing-library/react` for component tests
- Mock Supabase client in tests, never hit real database

## Git Conventions

- **Commits:** Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`)
- **Branches:** `feat/description`, `fix/description`, `chore/description`
- **PR titles:** Same as conventional commits
- Reference issue/story: `feat: add user profile page [STORY-1.2]`

## Common Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm test             # Run Jest tests
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run typecheck    # TypeScript type checking
npm run format       # Prettier formatting
```

## Environment Variables

- `.env.local` for local development (gitignored)
- `.env.example` as template (committed)
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server-only: `SUPABASE_SERVICE_ROLE_KEY` (never prefix with `NEXT_PUBLIC_`)

## Error Handling

```typescript
// API route pattern
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/resource failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}
```

## Important Notes

- Always check `npm run typecheck` before committing
- Never store secrets in client-side code or `NEXT_PUBLIC_` variables
- Use `loading.tsx` and `error.tsx` for route-level loading/error states
- Prefer Server Actions for mutations over API routes when possible
