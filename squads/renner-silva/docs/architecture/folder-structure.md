# Folder Structure - Metodo Aplauda de Pe

**Version:** 1.0
**Date:** 2026-02-13
**Parent:** `docs/architecture/architecture.md` Section 4

---

## Complete Application Structure

```
knowledge-base-renner-silva/
|
+-- data/                              # Knowledge base JSON files (source of truth)
|   +-- taxonomy.json                  # 5 modules with full taxonomy
|   +-- concepts.json                  # 15 concepts with relationships
|   +-- exercises.json                 # 25 exercises with instructions
|   +-- learning-paths.json            # 4 learning trails
|   +-- sources.json                   # Source traceability
|   +-- quizzes.json                   # [NEW] Quiz questions per module (Epic 3)
|
+-- app/                               # Next.js application
|   +-- app/                           # App Router (pages and layouts)
|   |   +-- layout.tsx                 # Root layout (html, body, fonts, providers)
|   |   +-- page.tsx                   # Root page (redirect to dashboard or landing)
|   |   +-- not-found.tsx              # Custom 404 page
|   |   +-- error.tsx                  # Global error boundary (Sentry)
|   |   +-- loading.tsx                # Global loading state
|   |   +-- globals.css                # Global styles, CSS variables, design tokens
|   |   +-- middleware.ts              # Auth route protection (v2.0)
|   |   |
|   |   +-- (public)/                  # PUBLIC ROUTE GROUP (no auth required)
|   |   |   +-- layout.tsx             # Public layout (minimal header, no sidebar)
|   |   |   +-- page.tsx               # Landing page (redirect or marketing)
|   |   |
|   |   +-- (auth)/                    # AUTH ROUTE GROUP (unauthenticated only)
|   |   |   +-- layout.tsx             # Auth layout (centered card, no nav)
|   |   |   +-- login/
|   |   |   |   +-- page.tsx           # Login form (email/password + Google OAuth)
|   |   |   +-- signup/
|   |   |   |   +-- page.tsx           # Registration form
|   |   |   +-- reset-password/
|   |   |   |   +-- page.tsx           # Password reset request
|   |   |   +-- callback/
|   |   |       +-- route.ts           # OAuth callback handler
|   |   |
|   |   +-- (dashboard)/              # PROTECTED ROUTE GROUP (auth required)
|   |   |   +-- layout.tsx             # Dashboard layout (header + sidebar + footer)
|   |   |   +-- page.tsx               # Main dashboard (journey overview, modules, stats)
|   |   |   |
|   |   |   +-- modules/
|   |   |   |   +-- [id]/
|   |   |   |       +-- page.tsx       # Module detail page (concepts, exercises, checkpoints)
|   |   |   |       +-- loading.tsx    # Module loading skeleton
|   |   |   |
|   |   |   +-- paths/
|   |   |   |   +-- page.tsx           # Learning trail selection page
|   |   |   |
|   |   |   +-- exercises/
|   |   |   |   +-- [id]/
|   |   |   |       +-- page.tsx       # Exercise detail page
|   |   |   |
|   |   |   +-- concepts/
|   |   |   |   +-- graph/
|   |   |   |       +-- page.tsx       # Concept relationship graph (Epic 3)
|   |   |   |
|   |   |   +-- checkpoints/
|   |   |   |   +-- page.tsx           # All checkpoints overview page
|   |   |   |
|   |   |   +-- quizzes/
|   |   |   |   +-- [moduleId]/
|   |   |   |       +-- page.tsx       # Quiz for specific module (Epic 3)
|   |   |   |
|   |   |   +-- badges/
|   |   |   |   +-- page.tsx           # Badge collection page (Epic 4)
|   |   |   |
|   |   |   +-- profile/
|   |   |   |   +-- page.tsx           # User profile page (Epic 2)
|   |   |   |
|   |   |   +-- search/
|   |   |       +-- page.tsx           # Search results page (Epic 3)
|   |   |
|   |   +-- instructor/               # INSTRUCTOR ROUTE GROUP (role-protected)
|   |   |   +-- layout.tsx             # Instructor layout
|   |   |   +-- page.tsx               # Instructor dashboard (metrics, Epic 2)
|   |   |
|   |   +-- api/                       # API ROUTE HANDLERS
|   |       +-- webhooks/
|   |       |   +-- supabase/
|   |       |       +-- route.ts       # Supabase webhook handler
|   |       +-- certificates/
|   |       |   +-- [trailId]/
|   |       |       +-- route.ts       # PDF certificate generation (Epic 3)
|   |       +-- health/
|   |           +-- route.ts           # Health check endpoint
|   |
|   +-- components/                    # REACT COMPONENTS
|   |   +-- ui/                        # Base UI Components (Design System)
|   |   |   +-- module-card.tsx        # [EXISTS] Module card with progress
|   |   |   +-- stat-card.tsx          # [EXISTS] Statistic display card
|   |   |   +-- progress-bar.tsx       # [EXISTS] Progress bar variants
|   |   |   +-- journey-steps.tsx      # [EXISTS] Step-by-step journey display
|   |   |   +-- button.tsx             # Button variants
|   |   |   +-- input.tsx              # Input field with validation
|   |   |   +-- badge.tsx              # Badge/tag component
|   |   |   +-- skeleton.tsx           # Loading skeleton variants
|   |   |   +-- toast.tsx              # Toast notification component
|   |   |   +-- accordion.tsx          # Radix Accordion wrapper
|   |   |   +-- dialog.tsx             # Radix Dialog wrapper
|   |   |   +-- checkbox.tsx           # Radix Checkbox wrapper
|   |   |   +-- tabs.tsx               # Radix Tabs wrapper
|   |   |   +-- avatar.tsx             # Radix Avatar wrapper
|   |   |   +-- breadcrumb.tsx         # Navigation breadcrumb
|   |   |   +-- card.tsx               # Generic card container
|   |   |   +-- dropdown-menu.tsx      # Dropdown menu (user menu)
|   |   |
|   |   +-- features/                  # Feature-Specific Components
|   |   |   +-- checkpoint-list.tsx    # Interactive checkpoint list with toggle
|   |   |   +-- checkpoint-item.tsx    # Single checkpoint with check/uncheck
|   |   |   +-- module-sidebar.tsx     # Module navigation sidebar (desktop)
|   |   |   +-- concept-card.tsx       # Concept display with accordion
|   |   |   +-- exercise-card.tsx      # Exercise card with instructions
|   |   |   +-- trail-card.tsx         # Learning trail selection card
|   |   |   +-- concept-graph.tsx      # D3 force graph visualization (Epic 3)
|   |   |   +-- quiz-question.tsx      # Quiz question component (Epic 3)
|   |   |   +-- quiz-results.tsx       # Quiz results display (Epic 3)
|   |   |   +-- note-editor.tsx        # Markdown note editor (Epic 3)
|   |   |   +-- badge-card.tsx         # Badge display with locked/unlocked (Epic 4)
|   |   |   +-- streak-indicator.tsx   # Streak fire icon + count (Epic 4)
|   |   |   +-- celebration.tsx        # Confetti / celebration animations (Epic 4)
|   |   |   +-- pdf-certificate.tsx    # PDF certificate template (Epic 3)
|   |   |   +-- search-command.tsx     # Cmd+K search dialog (Epic 3)
|   |   |   +-- activity-calendar.tsx  # GitHub-style activity calendar (Epic 4)
|   |   |
|   |   +-- layout/                    # Layout Components
|   |   |   +-- header.tsx             # [EXISTS] App header with progress
|   |   |   +-- footer.tsx             # [EXISTS] App footer
|   |   |   +-- sidebar.tsx            # Dashboard sidebar navigation
|   |   |   +-- mobile-nav.tsx         # Mobile bottom navigation
|   |   |   +-- skip-nav.tsx           # Accessibility skip navigation link
|   |   |
|   |   +-- providers/                 # Context Providers
|   |       +-- app-providers.tsx      # Combined providers wrapper
|   |       +-- supabase-provider.tsx  # Supabase client provider (v2.0)
|   |       +-- posthog-provider.tsx   # Posthog analytics provider
|   |       +-- sentry-provider.tsx    # Sentry error boundary
|   |       +-- toast-provider.tsx     # Toast notification provider
|   |       +-- hydration-provider.tsx # Zustand hydration handler
|   |
|   +-- lib/                           # UTILITIES AND CLIENTS
|   |   +-- utils.ts                   # [EXISTS] cn() utility
|   |   +-- data.ts                    # Data loader (typed JSON imports)
|   |   +-- supabase/
|   |   |   +-- client.ts             # Supabase browser client
|   |   |   +-- server.ts             # Supabase server client (for RSC)
|   |   |   +-- middleware.ts          # Supabase middleware helper
|   |   |   +-- types.ts              # Generated Supabase types
|   |   +-- validators.ts             # Form validation schemas
|   |   +-- constants.ts              # App-wide constants
|   |   +-- analytics.ts              # Posthog event helpers
|   |   +-- progress-calculator.ts    # Module progress calculation logic
|   |   +-- checkpoint-mapper.ts      # Map checkpoints to modules
|   |   +-- format.ts                 # Date, number, string formatters
|   |
|   +-- stores/                        # ZUSTAND STORES
|   |   +-- progress-store.ts         # Checkpoint progress, trail selection, unlocks
|   |   +-- auth-store.ts             # User session and profile (v2.0)
|   |   +-- ui-store.ts              # Modal, toast, loading, sidebar state
|   |   +-- __tests__/
|   |       +-- progress-store.test.ts
|   |       +-- auth-store.test.ts
|   |       +-- ui-store.test.ts
|   |
|   +-- hooks/                         # CUSTOM REACT HOOKS
|   |   +-- use-module-progress.ts    # Module progress calculation hook
|   |   +-- use-checkpoints.ts        # Checkpoint operations hook
|   |   +-- use-module-unlock.ts      # Module unlock status hook
|   |   +-- use-trail.ts             # Active trail data hook
|   |   +-- use-supabase.ts          # Supabase client hook (v2.0)
|   |   +-- use-auth.ts             # Authentication state hook (v2.0)
|   |   +-- use-media-query.ts       # Responsive breakpoint hook
|   |   +-- use-keyboard-shortcut.ts # Keyboard shortcut handler (Cmd+K)
|   |   +-- use-reduced-motion.ts    # prefers-reduced-motion hook
|   |   +-- __tests__/
|   |       +-- use-module-progress.test.ts
|   |       +-- use-checkpoints.test.ts
|   |
|   +-- types/                         # TYPESCRIPT TYPES
|   |   +-- index.ts                  # Re-exports
|   |   +-- module.ts                 # Module, Concept, Technique types
|   |   +-- exercise.ts              # Exercise type
|   |   +-- learning-path.ts         # LearningPath, Trail types
|   |   +-- checkpoint.ts            # Checkpoint type
|   |   +-- progress.ts              # Progress state types
|   |   +-- badge.ts                 # Badge, UserBadge types
|   |   +-- quiz.ts                  # Quiz, QuizQuestion, QuizResult types
|   |   +-- user.ts                  # User, Profile types
|   |   +-- note.ts                  # Note type
|   |   +-- supabase.ts              # Generated Supabase database types
|   |
|   +-- config/                        # APP CONFIGURATION
|   |   +-- site.ts                   # Site metadata, branding
|   |   +-- navigation.ts            # Navigation items, routes
|   |   +-- checkpoints.ts           # Checkpoint definitions per module
|   |   +-- badges.ts                # Badge definitions (Epic 4)
|   |   +-- analytics-events.ts      # Posthog event name constants
|   |
|   +-- e2e/                           # E2E TESTS (Playwright)
|   |   +-- module-study.spec.ts
|   |   +-- trail-selection.spec.ts
|   |   +-- auth-flow.spec.ts
|   |   +-- badge-unlock.spec.ts
|   |   +-- streak.spec.ts
|   |
|   +-- public/                        # STATIC ASSETS
|       +-- icons/
|       |   +-- badge-*.svg           # Badge icons
|       +-- images/
|       |   +-- og-image.png          # Open Graph image
|       +-- favicon.ico
|       +-- manifest.json             # PWA manifest (future)
|       +-- robots.txt
|       +-- sitemap.xml               # Generated at build
|
+-- supabase/                          # SUPABASE LOCAL DEV (v2.0)
|   +-- migrations/
|   |   +-- 00001_initial_schema.sql  # Tables, RLS, triggers
|   |   +-- 00002_badges_seed.sql     # Badge definitions
|   +-- seed.sql                       # Test data seeding
|   +-- config.toml                    # Supabase local config
|
+-- curso/                             # Instructor course materials (not deployed)
+-- obsidian-vault/                    # Instructor Obsidian vault (not deployed)
+-- raw/                               # Raw source materials (not deployed)
+-- reports/                           # Quality reports
+-- docs/                              # Documentation
|   +-- product/
|   |   +-- PRD.md
|   +-- architecture/
|   |   +-- architecture.md           # This document's parent
|   |   +-- folder-structure.md       # This document
|   |   +-- data-flow.md
|   |   +-- deployment.md
|   +-- database/
|       +-- schema.sql
|       +-- schema-diagram.md
+-- .github/
|   +-- workflows/
|       +-- ci.yml                    # CI/CD pipeline
+-- .gitignore
+-- README.md
+-- netlify.toml                       # Netlify configuration
+-- playwright.config.ts               # E2E test configuration
```

---

## Directory Details

### `app/app/` - App Router Pages

**Purpose:** Contains all Next.js App Router pages and layouts. Organized using route groups `(groupName)` for logical separation without affecting URL structure.

**Route Groups:**

| Group | URL Prefix | Auth | Layout |
|-------|-----------|------|--------|
| `(public)/` | `/` | None | Minimal header, no sidebar |
| `(auth)/` | `/auth/*` | Redirect if authenticated | Centered card layout |
| `(dashboard)/` | `/dashboard/*`, `/modules/*`, `/paths/*` | Required | Full layout with sidebar |
| `instructor/` | `/instructor/*` | Required + role check | Instructor-specific layout |

**Naming conventions:**
- Page files: `page.tsx`
- Layout files: `layout.tsx`
- Loading UI: `loading.tsx`
- Error boundary: `error.tsx`
- Route handlers: `route.ts`
- Dynamic segments: `[paramName]/`

### `app/components/ui/` - Base UI Components

**Purpose:** Design system primitives. These components are reusable, styling-focused, and have no business logic. They accept data via props and emit events.

**Naming convention:** `kebab-case.tsx`

**Examples of existing components (to keep):**
- `module-card.tsx` - Module display card with progress bar and lock/unlock state
- `stat-card.tsx` - Statistic metric display (icon + value + label)
- `progress-bar.tsx` - Progress bar with size and color variants
- `journey-steps.tsx` - Step-by-step guide display

**New components to create:**
- `button.tsx` - Variants: primary, secondary, ghost, destructive, outline
- `input.tsx` - With label, error state, helper text
- `skeleton.tsx` - Loading placeholder for cards, text, avatars
- `toast.tsx` - Success, error, info, warning variants with auto-dismiss
- `breadcrumb.tsx` - Chevron-separated navigation path

**Convention:** Radix UI primitives are wrapped in this directory (accordion.tsx wraps @radix-ui/react-accordion) to apply project styling and reduce import complexity.

### `app/components/features/` - Feature Components

**Purpose:** Business-logic-aware components that compose UI primitives. These components may access stores, hooks, and data directly.

**Naming convention:** `kebab-case.tsx`

**Examples:**
- `checkpoint-list.tsx` - Reads from progress store, renders checkpoint items with toggle
- `concept-card.tsx` - Displays concept data from taxonomy, handles accordion expand
- `trail-card.tsx` - Shows trail info from learning-paths.json, handles selection

### `app/components/layout/` - Layout Components

**Purpose:** Structural components that define page layout. Used in `layout.tsx` files.

**Files:**
- `header.tsx` - [EXISTS] Sticky header with brand, progress indicator, user menu (v2.0)
- `footer.tsx` - [EXISTS] Footer with copyright and links
- `sidebar.tsx` - Dashboard sidebar with module navigation (desktop only)
- `mobile-nav.tsx` - Bottom tab navigation for mobile
- `skip-nav.tsx` - Accessibility skip-to-content link

### `app/lib/` - Utilities and Clients

**Purpose:** Pure functions, API clients, and helper modules. No React components or hooks.

**Key files:**

| File | Purpose | Example |
|------|---------|---------|
| `data.ts` | Typed JSON data loader | `getModules()`, `getConceptById(id)` |
| `utils.ts` | [EXISTS] General utilities | `cn()` class name merger |
| `progress-calculator.ts` | Module progress logic | `calculateModuleProgress(checkpoints, moduleId)` |
| `checkpoint-mapper.ts` | Map checkpoints to modules | `getCheckpointsForModule(moduleId)` |
| `supabase/client.ts` | Browser Supabase client | `createBrowserClient()` |
| `supabase/server.ts` | Server Supabase client | `createServerClient()` |
| `analytics.ts` | Posthog event wrappers | `trackModuleAccessed(moduleId)` |
| `validators.ts` | Form validation | `loginSchema`, `signupSchema` |

### `app/stores/` - Zustand Stores

**Purpose:** Client-side state management. Each store is a single file with state, actions, and selectors.

**Convention:** Named `{domain}-store.ts`. Export a `use{Domain}Store` hook.

**Files:**
- `progress-store.ts` - Checkpoints, unlocks, trail selection (persisted to localStorage, then Supabase)
- `auth-store.ts` - User session and profile data (v2.0)
- `ui-store.ts` - Modal states, toasts, loading flags, sidebar toggle

### `app/hooks/` - Custom React Hooks

**Purpose:** Reusable hooks that compose store access, data fetching, and side effects.

**Convention:** Named `use-{action-or-domain}.ts`.

**Examples:**
- `use-module-progress.ts` - Returns progress percentage, checkpoint count, unlock status for a module
- `use-checkpoints.ts` - Returns checkpoint list with completion state, toggle function
- `use-trail.ts` - Returns active trail data, exercises filtered by trail

### `app/types/` - TypeScript Types

**Purpose:** Shared type definitions. Derived from JSON data structures and Supabase schema.

**Convention:** Named `{domain}.ts`. Use `interface` for object shapes, `type` for unions/intersections.

**Key types derived from data:**

```typescript
// types/module.ts
interface Module {
  id: string;                    // "mod-1"
  numero: number;                // 1
  titulo: string;                // "Conexao Inicial..."
  objetivo_aprendizado: string;
  duracao_estimada: string;      // "2-3 horas"
  nivel_dificuldade: 'Iniciante' | 'Intermediario' | 'Avancado';
  conceitos_chave: ConceptSummary[];
  tecnicas: string[];
  exercicios: string[];
  armadilhas_comuns: string[];
  exemplos_lives: LiveExample[];
}

// types/exercise.ts
interface Exercise {
  id: string;                    // "ex-mod1-01"
  modulo: number;
  titulo: string;
  objetivo: string;
  nivel_dificuldade: string;
  tempo_estimado: string;
  tipo: 'Pratica Individual' | 'Pratica em Grupo' | 'Projeto Final';
  instrucoes: string[];
  criterios_sucesso: string[];
  recursos_necessarios: string[];
  conceitos_relacionados: string[];
  proximos_exercicios: string[];
}

// types/learning-path.ts
interface LearningPath {
  id: string;                    // "trilha-iniciante"
  nome: string;
  descricao: string;
  nivel: string;
  duracao_estimada: string;
  modulos_inclusos: number[];
  prerequisitos: string[];
  objetivos: string[];
  sequencia_aprendizado: LearningStep[];
  entrega_final: string;
  proxima_trilha: string | null;
}
```

### `app/config/` - App Configuration

**Purpose:** Constants and configuration objects. No runtime logic.

**Files:**
- `site.ts` - Site name, description, URLs, branding colors
- `navigation.ts` - Navigation items with route paths and icons
- `checkpoints.ts` - Checkpoint definitions mapped to modules (derived from CHECKPOINTS-PROGRESSO.md)
- `badges.ts` - Badge definitions with criteria and icons (Epic 4)
- `analytics-events.ts` - Posthog event name constants (prevents typos)

---

## File Naming Conventions Summary

| Type | Convention | Example |
|------|-----------|---------|
| Components | `kebab-case.tsx` | `module-card.tsx` |
| Pages | `page.tsx` (in route directory) | `app/(dashboard)/modules/[id]/page.tsx` |
| Layouts | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| Route handlers | `route.ts` | `app/api/health/route.ts` |
| Stores | `{domain}-store.ts` | `progress-store.ts` |
| Hooks | `use-{name}.ts` | `use-module-progress.ts` |
| Types | `{domain}.ts` | `module.ts` |
| Utilities | `kebab-case.ts` | `progress-calculator.ts` |
| Tests | `{name}.test.ts(x)` | `progress-store.test.ts` |
| E2E tests | `{flow}.spec.ts` | `module-study.spec.ts` |
| Config | `kebab-case.ts` | `analytics-events.ts` |

---

*Folder structure designed by Aria (Architect Agent)*
*Version 1.0 - 2026-02-13*
