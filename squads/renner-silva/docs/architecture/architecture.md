# Metodo Aplauda de Pe - Technical Architecture Document

**Version:** 1.0
**Date:** 2026-02-13
**Author:** Aria (Architect Agent)
**PRD Reference:** `docs/product/PRD.md` v1.0
**Status:** Ready for Review

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Service Architecture](#3-service-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Database Design](#5-database-design)
6. [Data Flow Architecture](#6-data-flow-architecture)
7. [State Management Strategy](#7-state-management-strategy)
8. [Authentication Architecture](#8-authentication-architecture)
9. [Testing Strategy](#9-testing-strategy)
10. [Deployment Pipeline](#10-deployment-pipeline)
11. [Performance Optimization](#11-performance-optimization)
12. [Security Considerations](#12-security-considerations)
13. [Monitoring and Observability](#13-monitoring-and-observability)
14. [Technical Risks and Mitigations](#14-technical-risks-and-mitigations)
15. [Architecture Decision Records](#15-architecture-decision-records)

---

## 1. Architecture Overview

### System Context

The platform "Metodo Aplauda de Pe" is an educational web application that guides students through a 5-module public speaking and storytelling method created by instructor Renner Silva. The architecture follows a **Monolith Next.js + Supabase BaaS** pattern, optimized for a timeline of 20 hours for Epic 1 and free-tier constraints.

```
+-------------------------------------------------------------------+
|                        CLIENT (Browser)                           |
|  Next.js App (SSR/SSG) + React 19.2 + Zustand 5.0                |
+-------------------------------------------------------------------+
         |                    |                    |
         v                    v                    v
+------------------+  +------------------+  +------------------+
|  Static Assets   |  |  Supabase Auth   |  |  Supabase DB     |
|  (Netlify CDN)   |  |  (JWT + OAuth)   |  |  (PostgreSQL)    |
+------------------+  +------------------+  +------------------+
         |                    |                    |
         v                    v                    v
+------------------+  +------------------+  +------------------+
|  Sentry          |  |  Posthog         |  |  Supabase        |
|  (Error Track)   |  |  (Analytics)     |  |  (Storage)       |
+------------------+  +------------------+  +------------------+
```

### Architecture Principles

| Principle | Application |
|-----------|-------------|
| **Progressive Enhancement** | v1.1 works with JSON + localStorage; v2.0 adds Supabase without breaking v1.1 flows |
| **Mobile-First** | All components designed for mobile viewport first, enhanced for desktop |
| **Server-First Rendering** | Use React Server Components where possible; client components only when interactivity is required |
| **Optimistic Updates** | UI reflects state changes immediately; background sync handles persistence |
| **Cost-Conscious** | Architecture respects free-tier limits (Supabase 500MB, Netlify 300 build min/month) |
| **Data-Centric** | JSON knowledge base drives the entire content layer; schema derives from data, not the other way around |

### Version Roadmap

| Version | Scope | Data Layer | Auth |
|---------|-------|-----------|------|
| **v1.1** (Epic 1) | Real data, module pages, localStorage progress, deployment | JSON static import | None |
| **v2.0-P1** (Epic 2) | Auth, Supabase migration, user profile, instructor dashboard | Supabase | Supabase Auth |
| **v2.0-P2** (Epic 3) | Search, concept graph, quizzes, notes, certificates | Supabase + full-text | Supabase Auth |
| **v2.0-P3** (Epic 4) | Badges, streaks, celebrations, gamification | Supabase | Supabase Auth |
| **v3.0** (Epic 5) | Video player, community, forum, advanced analytics | Supabase + Realtime | Supabase Auth |

---

## 2. Technology Stack

### Core Stack (Confirmed)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.1.6 | SSR, SSG, App Router, Turbopack |
| UI Library | React | 19.2.3 | Component rendering, Server Components |
| Styling | Tailwind CSS | v4 | Utility-first CSS, CSS variables |
| Components | Radix UI | Latest | Accessible headless UI primitives |
| State | Zustand | 5.0 | Client-side state, persist middleware |
| Backend | Supabase | Latest | PostgreSQL, Auth, Storage, Realtime |
| Hosting | Netlify | N/A | CDN, edge functions, auto-deploy |
| CI/CD | GitHub Actions | N/A | Lint, typecheck, test, deploy |
| Monitoring | Sentry | Latest | Error tracking, performance |
| Analytics | Posthog | Latest | Event tracking, product analytics |
| Language | TypeScript | 5.6+ | Type safety, strict mode |

### Additional Dependencies (To Add)

| Package | Purpose | Version Target | Epic |
|---------|---------|---------------|------|
| `@supabase/supabase-js` | Supabase client | ^2.x | Epic 1 (Story 1.3) |
| `@supabase/ssr` | SSR helpers for Next.js | ^0.x | Epic 2 (Story 2.1) |
| `@sentry/nextjs` | Error monitoring | ^8.x | Epic 1 (Story 1.2) |
| `posthog-js` | Analytics client | ^1.x | Epic 1 (Story 1.2) |
| `@netlify/plugin-nextjs` | Netlify adapter | ^5.x | Epic 1 (Story 1.1) |
| `@testing-library/react` | Component testing | ^16.x | Epic 1 (Story 1.6) |
| `@testing-library/jest-dom` | DOM matchers | ^6.x | Epic 1 (Story 1.6) |
| `jest` | Test runner | ^30.x | Epic 1 (Story 1.1) |
| `playwright` | E2E testing | ^1.x | Epic 2 |
| `react-force-graph-2d` | Concept graph visualization | ^1.x | Epic 3 (Story 3.2) |
| `@react-pdf/renderer` | PDF certificate generation | ^4.x | Epic 3 (Story 3.5) |
| `canvas-confetti` | Celebration animations | ^1.x | Epic 4 (Story 4.3) |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint 9 + eslint-config-next | Code quality |
| Prettier | Code formatting |
| TypeScript strict mode | Type safety |
| Husky + lint-staged | Pre-commit hooks |
| Turbopack | Fast dev server (bundled with Next.js 16) |

---

## 3. Service Architecture

### Monolith with BaaS

The application follows a **Monolith Next.js + Supabase BaaS** pattern. There is no custom backend server. All server-side logic runs as:

1. **React Server Components** (RSC) for data loading
2. **Next.js Route Handlers** (`app/api/`) for webhook endpoints and server-only operations
3. **Supabase Edge Functions** for scheduled tasks (streak calculation, email notifications)
4. **Supabase Database Functions** for data integrity (triggers, RLS, computed fields)

```
+---------------------------------------------------------+
|                   Next.js Application                    |
|                                                          |
|  +-------------------+  +----------------------------+   |
|  | Server Components |  | Client Components          |   |
|  | (Data Loading)    |  | (Interactivity)            |   |
|  +-------------------+  +----------------------------+   |
|           |                         |                    |
|  +-------------------+  +----------------------------+   |
|  | Route Handlers    |  | Zustand Stores             |   |
|  | (app/api/)        |  | (Client-side state)        |   |
|  +-------------------+  +----------------------------+   |
+---------------------------------------------------------+
            |                         |
            v                         v
+---------------------------------------------------------+
|                   Supabase Platform                      |
|  +-------------+  +----------+  +---------+  +---------+ |
|  | PostgreSQL  |  | Auth     |  | Storage |  | Edge Fn | |
|  | + RLS       |  | (JWT)    |  | (Files) |  | (Cron)  | |
|  +-------------+  +----------+  +---------+  +---------+ |
+---------------------------------------------------------+
```

### Request Flow

**Static Content (v1.1):**
```
Browser → Netlify CDN → Pre-rendered HTML (SSG) → JSON data bundled at build time
```

**Authenticated Content (v2.0+):**
```
Browser → Netlify CDN → Next.js SSR → Supabase (data + auth verification) → Response
```

**Progress Updates (v2.0+):**
```
User action → Zustand store update (optimistic) → Supabase write (background) → Confirmation
```

---

## 4. Folder Structure

The complete folder structure is detailed in a companion document.

**Reference:** [`docs/architecture/folder-structure.md`](/Users/luizfosc/Projects/knowledge-base-renner-silva/docs/architecture/folder-structure.md)

### Summary

```
app/                          # Next.js application root
  app/                        # App Router pages
    (auth)/                   # Authentication route group (unauthenticated)
    (dashboard)/              # Protected route group (authenticated)
    (public)/                 # Public marketing/landing pages
    api/                      # API route handlers
    layout.tsx                # Root layout
    page.tsx                  # Landing/redirect page
  components/                 # React components
    ui/                       # Base UI components (design system)
    features/                 # Feature-specific components
    layout/                   # Layout components (header, footer, sidebar)
    providers/                # Context providers
  lib/                        # Utilities and clients
  stores/                     # Zustand stores
  hooks/                      # Custom React hooks
  types/                      # TypeScript type definitions
  config/                     # App configuration constants
data/                         # Knowledge base JSON files (source of truth)
docs/                         # Documentation
```

---

## 5. Database Design

The complete Supabase PostgreSQL schema is detailed in companion documents.

**References:**
- SQL Schema: [`docs/database/schema.sql`](/Users/luizfosc/Projects/knowledge-base-renner-silva/docs/database/schema.sql)
- Schema Diagram: [`docs/database/schema-diagram.md`](/Users/luizfosc/Projects/knowledge-base-renner-silva/docs/database/schema-diagram.md)

### Table Summary

| Table | Purpose | RLS | Epic |
|-------|---------|-----|------|
| `profiles` | User data, preferences, selected learning path | Yes - own data only | 1.3 |
| `progress` | Checkpoint completion tracking | Yes - own data only | 1.3 |
| `notes` | Personal annotations per concept/exercise/module | Yes - own data only | 1.3 |
| `badges` | Badge definitions (name, criteria, rarity) | Yes - read all | 2.0 |
| `user_badges` | Badges earned by users | Yes - own data only | 2.0 |
| `quiz_results` | Quiz scores per module per user | Yes - own data only | 2.0 |
| `streaks` | Daily study streak tracking | Yes - own data only | 2.0 |

### Key Design Decisions

1. **Content stays in JSON files** for v1.1 (no need to seed Supabase with course content until v2.0+)
2. **User-generated data** goes to Supabase (progress, notes, quiz results, badges)
3. **RLS on every table** - users can only read/write their own data
4. **Instructor role** sees aggregated data via `rpc` functions, never individual student data
5. **`profiles` table auto-created** via trigger on `auth.users` insert

---

## 6. Data Flow Architecture

The complete data flow architecture is detailed in a companion document.

**Reference:** [`docs/architecture/data-flow.md`](/Users/luizfosc/Projects/knowledge-base-renner-silva/docs/architecture/data-flow.md)

### v1.1 Data Flow (localStorage)

```
data/*.json                     # Source of truth for course content
    |
    v (static import at build time)
app/lib/data.ts                 # Typed data loader
    |
    v (import in RSC or client)
React Components                # Display content
    |
    v (user interactions)
Zustand Store                   # progress-store with persist middleware
    |
    v (automatic via persist)
localStorage                    # Browser persistence
```

### v2.0 Data Flow (Supabase)

```
data/*.json                     # Course content (still static import)
    |
    v
React Server Components         # Display content (no change from v1.1)

User Progress:
  Zustand Store (cache)  <-->  Supabase (source of truth)
       |                            |
       v                            v
  Optimistic UI              Background sync
```

### Migration Path (localStorage to Supabase)

| Step | Trigger | Action |
|------|---------|--------|
| 1 | User signs up / logs in for first time | Check localStorage for existing progress |
| 2 | localStorage has data | Read all checkpoint states + selected trail |
| 3 | Migrate to Supabase | Batch insert into `progress` table + update `profiles.learning_path_id` |
| 4 | Confirm migration | Clear localStorage progress data |
| 5 | Ongoing | Zustand store reads from Supabase on mount, writes optimistically |

### Sync Strategy

- **Optimistic Updates:** Zustand updates immediately on user action; Supabase write fires in background
- **Conflict Resolution:** Last-write-wins (timestamp-based). Since single-user data, conflicts are rare (multi-device only)
- **Cache Invalidation:** Zustand store rehydrates from Supabase on page load; stale-while-revalidate pattern
- **Offline Tolerance:** If Supabase write fails, queue in localStorage and retry on next page load

---

## 7. State Management Strategy

### Store Architecture

Three Zustand stores, each with a specific responsibility:

| Store | File | Responsibility | Persist? |
|-------|------|---------------|----------|
| `useProgressStore` | `stores/progress-store.ts` | Checkpoints, module unlock, trail selection | Yes (localStorage -> Supabase) |
| `useAuthStore` | `stores/auth-store.ts` | User session, profile data | No (Supabase handles session) |
| `useUIStore` | `stores/ui-store.ts` | Modals, toasts, loading states, sidebar | No |

### progress-store.ts (Detailed Design)

```typescript
interface ProgressState {
  // State
  checkpoints: Record<string, boolean>;       // checkpoint_id -> completed
  selectedTrailId: string | null;             // learning path id
  lastActivityAt: string | null;              // ISO timestamp
  moduleUnlockCache: Record<number, boolean>; // module number -> unlocked

  // Computed (via selectors)
  // getModuleProgress(moduleId: number): number
  // isModuleUnlocked(moduleId: number): boolean
  // getOverallProgress(): number
  // getCompletedCheckpointsForModule(moduleId: number): string[]

  // Actions
  toggleCheckpoint: (checkpointId: string) => void;
  selectTrail: (trailId: string) => void;
  recalculateUnlocks: () => void;
  hydrateFromSupabase: (data: SupabaseProgressData) => void;
  migrateFromLocalStorage: () => Promise<void>;
  reset: () => void;
}
```

**Persist configuration:**

```typescript
// CORRECT pattern per gotcha: explicit type + extra parentheses
const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'aplauda-progress',
      version: 1,
      // Skip hydration for SSR safety
      skipHydration: true,
      partialize: (state) => ({
        checkpoints: state.checkpoints,
        selectedTrailId: state.selectedTrailId,
        lastActivityAt: state.lastActivityAt,
      }),
    }
  )
);
```

**Hydration handling (SSR-safe):**

```typescript
// In a client component or layout:
useEffect(() => {
  useProgressStore.persist.rehydrate();
}, []);
```

### auth-store.ts (Detailed Design)

```typescript
interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

**Not persisted** - Supabase handles session persistence via cookies (`@supabase/ssr`).

### ui-store.ts (Detailed Design)

```typescript
interface UIState {
  // Modal states
  activeModal: string | null;
  modalData: unknown;

  // Toast queue
  toasts: Toast[];

  // Loading
  globalLoading: boolean;

  // Sidebar
  sidebarOpen: boolean;

  // Search
  searchOpen: boolean;
  searchQuery: string;

  // Actions
  openModal: (id: string, data?: unknown) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
}
```

---

## 8. Authentication Architecture

### Auth Flow (v2.0 - Epic 2)

```
[Login Page] --> [Supabase Auth] --> [JWT Token in Cookie]
                       |
                       v
              [auth.users table]
                       |
                       v (trigger: on_auth_user_created)
              [profiles table] (auto-created)
                       |
                       v
              [Next.js Middleware] (validates session on protected routes)
                       |
                       v
              [Protected Page] (user data available via getUser())
```

### Route Protection Strategy

| Route Group | Auth Required | Middleware Action |
|-------------|--------------|-------------------|
| `(public)/` | No | Pass through |
| `(auth)/` | No (redirect if authenticated) | Redirect to dashboard if session exists |
| `(dashboard)/` | Yes | Redirect to login if no session |
| `api/webhooks/` | No (validated by secret) | Verify webhook signature |
| `api/` (other) | Yes | Return 401 if no session |

### Middleware Implementation

```typescript
// middleware.ts (at app/ root)
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create Supabase client with cookie handling
  const supabase = createServerClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes: redirect to login
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Auth routes: redirect to dashboard if already logged in
  if (pathname.startsWith('/auth/') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/profile/:path*', '/instructor/:path*'],
};
```

### Roles

| Role | How Assigned | Capabilities |
|------|-------------|-------------|
| `student` | Default on signup | CRUD own data, view course content |
| `instructor` | Manual via Supabase dashboard | View aggregated metrics, manage content |

Role is stored in `profiles.role` column with default `'student'`. The instructor role is assigned manually by editing the row in Supabase dashboard (per PRD Story 2.4 AC #7).

---

## 9. Testing Strategy

### Testing Pyramid

```
        /  E2E  \           <- Playwright (5 critical flows)
       /----------\
      / Integration \       <- Jest (data loading, Supabase mock, progress calc)
     /----------------\
    /    Unit Tests     \   <- Jest + RTL (stores, utils, hooks, components)
   /____________________\

   Coverage Target: 70% for business logic (stores, utils, hooks)
```

### Unit Tests (Jest + React Testing Library)

**What to test:**
- Zustand stores: state transitions, selectors, persist behavior
- Utility functions: `cn()`, data transformers, progress calculators
- Custom hooks: `useModuleProgress`, `useCheckpoints`
- Components: render with props, accessibility, user interaction

**File structure convention:**
```
stores/
  progress-store.ts
  __tests__/
    progress-store.test.ts
hooks/
  use-module-progress.ts
  __tests__/
    use-module-progress.test.ts
components/
  ui/
    module-card.tsx
    __tests__/
      module-card.test.tsx
```

**Example test (progress store):**
```typescript
describe('useProgressStore', () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it('should toggle checkpoint completion', () => {
    const { toggleCheckpoint, checkpoints } = useProgressStore.getState();
    toggleCheckpoint('cp-1.1');
    expect(useProgressStore.getState().checkpoints['cp-1.1']).toBe(true);
  });

  it('should unlock module 2 when 70% of module 1 checkpoints are complete', () => {
    // Complete 3 out of 4 checkpoints for module 1 (75% > 70% threshold)
    ['cp-1.1', 'cp-1.2', 'cp-1.3'].forEach(cp =>
      useProgressStore.getState().toggleCheckpoint(cp)
    );
    useProgressStore.getState().recalculateUnlocks();
    expect(useProgressStore.getState().isModuleUnlocked(2)).toBe(true);
  });
});
```

### Integration Tests (Jest)

**What to test:**
- Data loader returns correctly typed data from JSON files
- Supabase client mock verifies correct queries
- Progress calculation with real checkpoint data
- Module unlock logic with real taxonomy data

**Supabase mocking strategy:**
```typescript
// __mocks__/supabase.ts
jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      update: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
}));
```

### E2E Tests (Playwright)

**Critical flows:**

| Flow | Steps | Priority |
|------|-------|----------|
| **Module Study** | Open dashboard -> Click module 1 -> Read content -> Complete checkpoint -> Verify progress updates | P0 |
| **Trail Selection** | Navigate to trails -> Select "Iniciante" -> Verify dashboard reflects selection | P0 |
| **Login + Progress Sync** | Login -> Verify localStorage progress migrates -> Verify Supabase has data | P1 |
| **Badge Unlock** | Complete all module 1 checkpoints -> Verify badge notification -> Verify badge page | P1 |
| **Streak Maintenance** | Complete checkpoint day 1 -> Return day 2 -> Complete checkpoint -> Verify streak = 2 | P2 |

**Playwright configuration:**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
});
```

### Accessibility Testing

Integrated via `jest-axe` in component tests:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<ModuleCard {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 10. Deployment Pipeline

The complete deployment architecture is detailed in a companion document.

**Reference:** [`docs/architecture/deployment.md`](/Users/luizfosc/Projects/knowledge-base-renner-silva/docs/architecture/deployment.md)

### Pipeline Summary

```
Developer Push
      |
      v
GitHub Actions CI
  +-- Lint (ESLint)
  +-- Typecheck (tsc --noEmit)
  +-- Unit + Integration Tests (Jest)
  +-- Build (next build)
      |
      v (on main branch only)
Netlify Deploy
  +-- Auto-deploy from GitHub
  +-- @netlify/plugin-nextjs
  +-- CDN distribution
      |
      v (post-deploy)
E2E Tests (Playwright)
  +-- Run against production URL
  +-- Report to GitHub PR
```

### Environment Configuration

| Variable | Scope | Used In |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Server-side operations, migrations |
| `SENTRY_DSN` | Server only | Error tracking |
| `NEXT_PUBLIC_SENTRY_DSN` | Public | Client-side error tracking |
| `SENTRY_AUTH_TOKEN` | CI only | Source map upload |
| `NEXT_PUBLIC_POSTHOG_KEY` | Public | Analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | Public | Analytics host |

---

## 11. Performance Optimization

### Rendering Strategy

| Page | Strategy | Revalidate | Reason |
|------|----------|-----------|--------|
| Landing page | SSG | N/A | Static content, no user data |
| Module detail pages | SSG | 24h (ISR) | Content changes rarely; pre-render all 5 |
| Dashboard | SSR | N/A | Needs fresh user progress data |
| Profile page | SSR | N/A | User-specific data |
| Trail selection | SSG | 24h (ISR) | Static trail content |
| Concept graph | CSR (client) | N/A | Heavy D3/force-graph rendering |
| Instructor dashboard | SSR | N/A | Aggregated real-time data |
| Auth pages | SSG | N/A | Static forms |

### Static Generation for Module Pages

```typescript
// app/(dashboard)/modules/[id]/page.tsx
import { getModuleById, getAllModuleIds } from '@/lib/data';

// Pre-generate all 5 module pages at build time
export async function generateStaticParams() {
  return getAllModuleIds().map((id) => ({ id }));
}

export const revalidate = 86400; // ISR: revalidate every 24 hours

export default async function ModulePage({ params }: { params: { id: string } }) {
  const module = getModuleById(params.id);
  // ... render
}
```

### Image Optimization

- Use `next/image` for all images (automatic WebP/AVIF conversion)
- Avatar images served from Supabase Storage with transformation API
- Badge icons as SVG (inline, no network request)
- Module illustrations as optimized PNG with blur placeholder

### Code Splitting

```typescript
// Dynamic import for heavy components
const ConceptGraph = dynamic(() => import('@/components/features/concept-graph'), {
  loading: () => <GraphSkeleton />,
  ssr: false, // Force client-side only (D3 dependency)
});

const ConfettiCelebration = dynamic(() => import('@/components/features/confetti'), {
  ssr: false,
});

const PDFCertificate = dynamic(() => import('@/components/features/pdf-certificate'), {
  ssr: false,
});
```

### Caching Strategy

| Resource | Cache Strategy | TTL |
|----------|---------------|-----|
| Static assets (JS/CSS) | Immutable | 1 year |
| Module page HTML | ISR | 24 hours |
| User progress | Zustand + SWR | Stale-while-revalidate, 60s |
| Supabase queries | SWR deduplication | 30s |
| Badge definitions | In-memory (small dataset) | App lifecycle |
| Avatar images | Supabase Storage CDN | 7 days |

### Bundle Size Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| First Load JS | < 100KB | Tree-shaking, dynamic imports |
| Route chunk | < 50KB | Per-page code splitting |
| Largest Contentful Paint | < 2s (3G) | SSG + CDN + image optimization |
| Cumulative Layout Shift | < 0.1 | Skeleton loaders, explicit dimensions |
| Interaction to Next Paint | < 200ms | Optimistic updates, local state |

---

## 12. Security Considerations

### Authentication Security

| Concern | Mitigation |
|---------|-----------|
| Session hijacking | Supabase uses httpOnly cookies with Secure flag |
| CSRF | SameSite cookie attribute + Supabase built-in CSRF protection |
| OAuth token exposure | Handled server-side by Supabase Auth callback |
| Password strength | Supabase Auth enforced minimum length (configured in dashboard) |
| Brute force | Supabase built-in rate limiting on auth endpoints |

### Data Security

| Concern | Mitigation |
|---------|-----------|
| Unauthorized data access | RLS policies on every table (see schema.sql) |
| SQL injection | Supabase client uses parameterized queries by default |
| XSS | React auto-escapes JSX; dangerouslySetInnerHTML never used |
| Sensitive data exposure | Service role key only on server; anon key is safe for client |
| Environment leaks | `.env.local` in `.gitignore`; Netlify env vars for production |

### Row Level Security (RLS) Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Own row only | Auto (trigger) | Own row only | Not allowed |
| `progress` | Own rows only | Own rows only | Own rows only | Own rows only |
| `notes` | Own rows only | Own rows only | Own rows only | Own rows only |
| `badges` | All (read-only) | Admin only | Admin only | Admin only |
| `user_badges` | Own rows only | System (trigger) | Not allowed | Not allowed |
| `quiz_results` | Own rows only | Own rows only | Own rows only | Not allowed |
| `streaks` | Own rows only | System only | System only | Not allowed |

### Content Security

- Course content (JSON) is bundled at build time, not queryable via API
- No user-generated content is rendered as HTML (Markdown notes rendered via safe parser)
- File uploads (avatars) restricted to image MIME types via Supabase Storage policies

---

## 13. Monitoring and Observability

### Sentry Configuration

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,       // 10% of transactions
  replaysSessionSampleRate: 0,  // No session replay (free tier)
  replaysOnErrorSampleRate: 1.0, // Record session on error

  beforeSend(event) {
    // Scrub PII from error reports
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

**Alert rules:**
- Notify on first occurrence of new error
- Alert if error rate exceeds 5% of sessions
- Alert on Lighthouse score drop below 85

### Posthog Events

| Event | Trigger | Properties |
|-------|---------|-----------|
| `page_viewed` | Every navigation | `path`, `referrer` |
| `module_accessed` | User opens module page | `module_id`, `module_name` |
| `checkpoint_completed` | User checks a checkpoint | `checkpoint_id`, `module_id`, `is_first_time` |
| `checkpoint_unchecked` | User unchecks a checkpoint | `checkpoint_id`, `module_id` |
| `trail_selected` | User selects learning path | `trail_id`, `trail_name`, `previous_trail_id` |
| `exercise_started` | User opens exercise detail | `exercise_id`, `module_id`, `type` |
| `quiz_submitted` | User submits quiz | `module_id`, `score`, `time_spent_seconds` |
| `badge_unlocked` | Badge awarded | `badge_id`, `badge_name`, `rarity` |
| `note_created` | User creates annotation | `entity_type`, `entity_id` |
| `search_performed` | User searches content | `query`, `results_count` |
| `certificate_downloaded` | User downloads PDF | `trail_id` |

### Posthog Funnels

**Primary funnel: Student Journey**
```
Signup -> Select Trail -> Complete First Checkpoint -> Complete Module 1 -> Complete All Modules
```

**Engagement funnel:**
```
Daily Visit -> Checkpoint Completed -> Note Created -> Quiz Submitted -> Badge Earned
```

---

## 14. Technical Risks and Mitigations

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Zustand persist hydration mismatch** | High | Medium | Use `skipHydration: true` + manual `rehydrate()` in `useEffect`. Wrap progress-dependent UI in `<ClientOnly>` component. This is a documented gotcha. |
| **Next.js 16 + Netlify compatibility** | Medium | High | `@netlify/plugin-nextjs` v5 supports Next.js 16. Pin exact versions. Test build on Netlify before any feature work. If issues arise, downgrade to Next.js 15.x (low migration cost since project is early). |
| **Supabase free tier limits** | Low | High | 500MB database limit. Course content stays in JSON (0 DB storage). User data is lightweight (progress = ~1KB/user). At 500 users with full progress, notes, badges: estimated ~50MB (10% of limit). Monitor via Supabase dashboard. |
| **Complex RLS policies** | Medium | Medium | Keep RLS policies simple: `auth.uid() = user_id` for most tables. Test policies with `supabase test` locally. Document each policy in schema.sql. Avoid complex joins in policies. |
| **Tailwind v4 breaking changes** | Low | Low | Tailwind v4 uses CSS-first configuration. Existing `tailwind.config.ts` works with compatibility layer. Monitor for issues during build. |
| **React 19 Server Component constraints** | Medium | Medium | Not all libraries support RSC. Keep client boundaries clear. Use `'use client'` directive only where interactivity is needed. Test Radix UI compatibility (confirmed v1.2+ supports React 19). |
| **Netlify free tier build minutes** | Low | Medium | 300 minutes/month. Average build: 2-3 minutes. Budget: ~100 builds/month. Avoid unnecessary deploys (branch deploys disabled for non-main branches). |
| **ISR revalidation on Netlify** | Medium | Low | Netlify supports On-Demand ISR via `@netlify/plugin-nextjs`. Verify ISR works correctly during Story 1.1 infrastructure setup. Fallback: use SSR for module pages. |

### Contingency Plans

| Scenario | Action |
|----------|--------|
| Supabase outage | v1.1 works fully offline (localStorage). v2.0+ degrades to read-only with cached data. |
| Netlify outage | No mitigation needed for free project. CDN failover is Netlify's responsibility. |
| Next.js 16 + Netlify incompatible | Downgrade to Next.js 15.x. Migration cost: update `package.json`, test build. |
| Free tier exhausted (Supabase) | Upgrade to Pro ($25/month) or optimize data usage. Unlikely at <500 users. |

---

## 15. Architecture Decision Records

### ADR-001: Monolith + BaaS over Custom Backend

**Context:** Timeline of 20 hours for Epic 1 does not allow building a custom backend.
**Decision:** Use Supabase as BaaS for all backend needs (database, auth, storage, edge functions).
**Consequences:** Vendor lock-in to Supabase. Migration to custom backend would require rewriting data access layer. Acceptable trade-off for speed of delivery.

### ADR-002: JSON Static Import for Course Content

**Context:** Course content is static (5 modules, 15 concepts, 25 exercises, 4 trails). Storing in Supabase adds complexity without benefit for v1.1.
**Decision:** Import JSON files statically at build time via TypeScript modules. Migrate to Supabase only when dynamic content editing is needed (v3.0+).
**Consequences:** Content changes require rebuild. Acceptable since content is curated by single instructor and changes rarely.

### ADR-003: Zustand over React Context for State Management

**Context:** Need client-side state with localStorage persistence, SSR compatibility, and minimal boilerplate.
**Decision:** Use Zustand 5.0 with persist middleware. Already in project dependencies.
**Consequences:** Requires careful hydration handling (skipHydration pattern). Well-documented gotcha in project gotchas.json.

### ADR-004: react-force-graph-2d for Concept Graph

**Context:** Need to visualize 15 concepts with directed relationships (prerequisites, related_to). Options: react-force-graph-2d, d3-force (raw), vis.js, cytoscape.js.
**Decision:** `react-force-graph-2d` - provides React-native API over d3-force, handles canvas rendering efficiently, supports zoom/pan, lightweight (~15KB gzipped).
**Consequences:** Canvas-based rendering means no native DOM accessibility for graph nodes. Mitigated by providing alternative list view on mobile.

### ADR-005: @react-pdf/renderer for Certificates

**Context:** Need server-side PDF generation for completion certificates. Options: @react-pdf/renderer, jsPDF, puppeteer, html-pdf.
**Decision:** `@react-pdf/renderer` - React-native API, server-side rendering compatible, no headless browser dependency, professional output.
**Consequences:** Learning curve for PDF layout primitives. But composable with existing React component patterns.

### ADR-006: Separate Route Groups for Auth Boundaries

**Context:** Need clear separation between public pages, auth pages, and protected pages.
**Decision:** Use Next.js route groups: `(public)/`, `(auth)/`, `(dashboard)/`. Each group has its own layout with appropriate providers and guards.
**Consequences:** Clean middleware logic. Each group can have distinct layout (e.g., auth pages have no sidebar; dashboard has sidebar).

---

*Architecture document generated by Aria (Architect Agent)*
*Version 1.0 - 2026-02-13*
*Based on PRD v1.0 by Morgan (PM Agent)*
