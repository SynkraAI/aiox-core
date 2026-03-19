# Data Flow Architecture - Metodo Aplauda de Pe

**Version:** 1.0
**Date:** 2026-02-13
**Parent:** `docs/architecture/architecture.md` Section 6

---

## 1. Data Sources

The platform has two distinct data categories:

| Category | Source | Mutability | Storage |
|----------|--------|-----------|---------|
| **Course Content** | JSON files in `data/` | Static (changes only via rebuild) | Bundled at build time |
| **User Data** | User interactions | Dynamic (read/write) | localStorage (v1.1) then Supabase (v2.0) |

### Course Content Files

| File | Records | Size | Content |
|------|---------|------|---------|
| `taxonomy.json` | 5 modules | ~12 KB | Modules with concepts, techniques, exercises, pitfalls |
| `concepts.json` | 15 concepts | ~15 KB | Detailed concepts with relationships, prerequisites |
| `exercises.json` | 25 exercises | ~10 KB | Exercises with instructions, criteria, resources |
| `learning-paths.json` | 4 trails | ~6 KB | Learning trails with sequences and deliverables |
| `sources.json` | 2 sources | ~2 KB | Source traceability |
| `quizzes.json` | ~40 questions | ~8 KB | Quiz questions per module (to be created) |

**Total bundled size: ~53 KB** (negligible impact on bundle).

---

## 2. v1.1 Data Flow (localStorage)

### Architecture Diagram

```
BUILD TIME:
  data/taxonomy.json  ----+
  data/concepts.json  ----+---> TypeScript imports in lib/data.ts
  data/exercises.json ----+        |
  data/learning-paths.json+        v
                            Typed data objects (Module[], Concept[], etc.)
                                   |
                                   v
RUNTIME (Server):
  React Server Components read from lib/data.ts
        |
        v
  Pre-rendered HTML (SSG) with course content
        |
        v
RUNTIME (Client):
  Hydrated React components display content
        |
        v (user interactions)
  Zustand progress-store.ts
    |-- toggleCheckpoint()
    |-- selectTrail()
    |-- recalculateUnlocks()
        |
        v (persist middleware)
  localStorage (key: 'aplauda-progress')
    {
      checkpoints: { "cp-1.1": true, "cp-1.2": false, ... },
      selectedTrailId: "trilha-iniciante",
      lastActivityAt: "2026-02-13T10:30:00Z"
    }
```

### Data Loader Implementation (lib/data.ts)

```typescript
// lib/data.ts
import taxonomyData from '../../data/taxonomy.json';
import conceptsData from '../../data/concepts.json';
import exercisesData from '../../data/exercises.json';
import learningPathsData from '../../data/learning-paths.json';

import type { Module, Concept, Exercise, LearningPath } from '@/types';

// ---- Modules ----
export function getModules(): Module[] {
  return taxonomyData.curso.modulos;
}

export function getModuleById(id: string): Module | undefined {
  return taxonomyData.curso.modulos.find(m => m.id === id);
}

export function getModuleByNumber(num: number): Module | undefined {
  return taxonomyData.curso.modulos.find(m => m.numero === num);
}

export function getAllModuleIds(): string[] {
  return taxonomyData.curso.modulos.map(m => m.id);
}

// ---- Concepts ----
export function getConcepts(): Concept[] {
  return conceptsData.conceitos;
}

export function getConceptById(id: string): Concept | undefined {
  return conceptsData.conceitos.find(c => c.id === id);
}

export function getConceptsByModule(moduleNum: number): Concept[] {
  return conceptsData.conceitos.filter(c => c.modulo === moduleNum);
}

// ---- Exercises ----
export function getExercises(): Exercise[] {
  return exercisesData.exercicios;
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercisesData.exercicios.find(e => e.id === id);
}

export function getExercisesByModule(moduleNum: number): Exercise[] {
  return exercisesData.exercicios.filter(e => e.modulo === moduleNum);
}

// ---- Learning Paths ----
export function getLearningPaths(): LearningPath[] {
  return learningPathsData.trilhas;
}

export function getLearningPathById(id: string): LearningPath | undefined {
  return learningPathsData.trilhas.find(t => t.id === id);
}
```

### Progress Flow (v1.1)

```
User clicks checkpoint [x]
        |
        v
CheckpointItem.onClick()
        |
        v
useProgressStore.toggleCheckpoint("cp-1.3")
        |
        +--> state.checkpoints["cp-1.3"] = true
        +--> state.lastActivityAt = new Date().toISOString()
        +--> recalculateUnlocks()
        |       |
        |       +--> For each module, check if 70% of checkpoints are complete
        |       +--> Update moduleUnlockCache
        |
        v (persist middleware, automatic)
localStorage.setItem("aplauda-progress", JSON.stringify({...}))
        |
        v (React re-render)
Dashboard, ModuleCard, ProgressBar all update via Zustand selectors
```

---

## 3. v2.0 Data Flow (Supabase)

### Architecture Diagram

```
BUILD TIME (unchanged):
  data/*.json ---> lib/data.ts ---> Typed data objects

RUNTIME (Server):
  React Server Components
    |-- Course content: from lib/data.ts (unchanged)
    |-- User data: from Supabase via server client
    v
  SSR HTML with course content + initial user state

RUNTIME (Client):
  Supabase Auth session (cookie-based)
        |
        v
  Zustand stores hydrate from Supabase
        |
        +-- progress-store: fetch user checkpoints
        +-- auth-store: fetch user profile
        |
        v (user interactions)
  Zustand store.toggleCheckpoint("cp-1.3")
        |
        +--> OPTIMISTIC: Update local state immediately
        |       |
        |       v
        |    UI re-renders instantly
        |
        +--> BACKGROUND: Supabase upsert
                |
                v
             supabase.from('progress').upsert({
               user_id: session.user.id,
               checkpoint_id: 'cp-1.3',
               module_id: 'mod-1',
               completed: true
             })
                |
                v (on success)
             No-op (optimistic was correct)
                |
                v (on failure)
             Rollback local state + show error toast
```

### Sync Strategy Detail

#### Hydration (on page load)

```typescript
// In a client component or provider:
useEffect(() => {
  async function hydrateProgress() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      // No auth - use localStorage (v1.1 mode)
      useProgressStore.persist.rehydrate();
      return;
    }

    // Fetch progress from Supabase
    const { data: progress } = await supabase
      .from('progress')
      .select('checkpoint_id, completed')
      .eq('user_id', session.session.user.id);

    // Hydrate store from Supabase data
    const checkpoints: Record<string, boolean> = {};
    progress?.forEach(p => {
      checkpoints[p.checkpoint_id] = p.completed;
    });

    useProgressStore.getState().hydrateFromSupabase({
      checkpoints,
      // ... other fields
    });
  }

  hydrateProgress();
}, []);
```

#### Optimistic Write (on checkpoint toggle)

```typescript
// In progress-store.ts:
toggleCheckpoint: async (checkpointId: string) => {
  const prev = get().checkpoints[checkpointId];
  const next = !prev;

  // 1. Optimistic update (immediate)
  set(state => ({
    checkpoints: { ...state.checkpoints, [checkpointId]: next },
    lastActivityAt: new Date().toISOString(),
  }));
  get().recalculateUnlocks();

  // 2. Background Supabase sync
  const session = useAuthStore.getState().user;
  if (!session) return; // localStorage-only mode

  const { error } = await supabase
    .from('progress')
    .upsert({
      user_id: session.id,
      checkpoint_id: checkpointId,
      module_id: deriveModuleId(checkpointId),
      completed: next,
      completed_at: next ? new Date().toISOString() : null,
    }, {
      onConflict: 'user_id,checkpoint_id',
    });

  // 3. Rollback on error
  if (error) {
    set(state => ({
      checkpoints: { ...state.checkpoints, [checkpointId]: prev },
    }));
    get().recalculateUnlocks();
    useUIStore.getState().addToast({
      type: 'error',
      message: 'Falha ao salvar progresso. Tente novamente.',
    });
  }
},
```

#### Conflict Resolution

| Scenario | Resolution | Reason |
|----------|-----------|--------|
| Same checkpoint toggled on two devices | Last-write-wins (Supabase upsert with `completed_at`) | Single-user data, conflicts are rare |
| Offline changes | Queue failed writes in localStorage, retry on reconnect | Graceful degradation |
| Supabase outage | Continue with local state, sync when available | Optimistic approach |

---

## 4. Migration Path (localStorage to Supabase)

### Trigger

Migration is triggered on **first successful login** of a user who has existing localStorage progress data.

### Flow

```
User logs in (first time)
        |
        v
Check localStorage for key 'aplauda-progress'
        |
        +-- NOT found --> Skip migration, fetch from Supabase
        |
        +-- FOUND --> Start migration
                |
                v
Read localStorage data:
  {
    checkpoints: { "cp-1.1": true, "cp-1.3": true, ... },
    selectedTrailId: "trilha-iniciante",
    lastActivityAt: "2026-02-13T10:30:00Z"
  }
                |
                v
Batch insert into Supabase:
  1. For each checkpoint where value=true:
     INSERT INTO progress (user_id, checkpoint_id, module_id, completed)
     VALUES (current_user_id, checkpoint_id, derived_module_id, true)
     ON CONFLICT (user_id, checkpoint_id) DO NOTHING

  2. Update profile with trail:
     UPDATE profiles
     SET learning_path_id = 'trilha-iniciante'
     WHERE id = current_user_id
                |
                v
Verify migration:
  Compare localStorage count vs Supabase count
                |
                +-- MATCH --> Clear localStorage 'aplauda-progress'
                |              Set flag 'aplauda-migration-done' = true
                |
                +-- MISMATCH --> Keep localStorage as backup
                                 Log warning to Sentry
                                 Retry on next page load
```

### Implementation

```typescript
// lib/migrate-progress.ts
export async function migrateLocalStorageToSupabase(userId: string): Promise<boolean> {
  const stored = localStorage.getItem('aplauda-progress');
  if (!stored) return false;

  const migrationDone = localStorage.getItem('aplauda-migration-done');
  if (migrationDone === 'true') return false;

  try {
    const data = JSON.parse(stored);
    const checkpoints = data.state?.checkpoints || data.checkpoints || {};

    // Prepare batch insert
    const rows = Object.entries(checkpoints)
      .filter(([, completed]) => completed)
      .map(([checkpointId]) => ({
        user_id: userId,
        checkpoint_id: checkpointId,
        module_id: deriveModuleId(checkpointId),
        completed: true,
      }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('progress')
        .upsert(rows, { onConflict: 'user_id,checkpoint_id' });

      if (error) throw error;
    }

    // Migrate trail selection
    if (data.state?.selectedTrailId || data.selectedTrailId) {
      const trailId = data.state?.selectedTrailId || data.selectedTrailId;
      await supabase
        .from('profiles')
        .update({ learning_path_id: trailId })
        .eq('id', userId);
    }

    // Verify and clear
    const { count } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count !== null && count >= rows.length) {
      localStorage.removeItem('aplauda-progress');
      localStorage.setItem('aplauda-migration-done', 'true');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Migration failed:', error);
    // Sentry.captureException(error);
    return false;
  }
}
```

---

## 5. Data Flow for Specific Features

### Module Detail Page

```
URL: /dashboard/modules/mod-1
        |
        v
Server Component (page.tsx):
  const module = getModuleById('mod-1');       // From lib/data.ts (static)
  const concepts = getConceptsByModule(1);     // From lib/data.ts (static)
  const exercises = getExercisesByModule(1);   // From lib/data.ts (static)
        |
        v
  Render module content (SSG/ISR)
        |
        v
Client Component (checkpoint-list.tsx):
  const checkpoints = useProgressStore(s => s.checkpoints);
  const isUnlocked = useProgressStore(s => s.isModuleUnlocked(1));
        |
        v
  Render interactive checkpoints (client-side)
```

### Trail Selection

```
User selects "Trilha Iniciante"
        |
        v
TrailCard.onSelect("trilha-iniciante")
        |
        v
useProgressStore.selectTrail("trilha-iniciante")
        |
        +--> set({ selectedTrailId: "trilha-iniciante" })
        +--> recalculateUnlocks()
        |
        v (persist -> localStorage OR Supabase)
Save to storage
        |
        v
Dashboard re-renders:
  - Exercises filtered by trail
  - Trail-specific stats displayed
  - Module sequence adjusted
```

### Badge Check (Epic 4)

```
Checkpoint completed event
        |
        v
Application logic checks all badge criteria:
  FOR each badge in badges table:
    IF criteria_type === 'checkpoint' AND criteria_value.checkpoint_id === completed_checkpoint:
      GRANT badge
    IF criteria_type === 'module' AND all module checkpoints complete:
      GRANT badge
    IF criteria_type === 'streak' AND current_streak >= criteria_value.streak_days:
      GRANT badge
    ...
        |
        v (if badge earned)
INSERT INTO user_badges (user_id, badge_id)
        |
        v
UI notification:
  useUIStore.addToast({ type: 'badge', badgeName: '...', badgeIcon: '...' })
  + confetti animation (if not prefers-reduced-motion)
```

### Instructor Dashboard (Epic 2)

```
Instructor navigates to /instructor
        |
        v
Server Component:
  const { data } = await supabase.rpc('get_instructor_metrics');
        |
        v
  Returns aggregated JSONB:
  {
    total_students: 150,
    active_students_7d: 42,
    completion_by_module: [...],
    most_stuck_checkpoint: "cp-3.4",
    trail_distribution: [...]
  }
        |
        v
  Render charts and metrics (no individual student data exposed)
```

---

## 6. Cache Invalidation Strategy

| Data Type | Cache Location | Invalidation Trigger | Strategy |
|-----------|---------------|---------------------|----------|
| Course content | Build bundle | JSON file change | Rebuild and redeploy (ISR revalidate 24h) |
| User checkpoints | Zustand store | Checkpoint toggle | Immediate (optimistic) |
| User profile | Zustand store | Profile update | Immediate (optimistic) |
| Badge definitions | SWR cache | App lifecycle | Stale-while-revalidate (rare changes) |
| Quiz results | SWR cache | Quiz submission | Immediate refresh |
| Instructor metrics | No cache | Page load | Fresh query every time (RPC) |
| Trail data | Build bundle | JSON file change | Rebuild |

---

*Data flow architecture designed by Aria (Architect Agent)*
*Version 1.0 - 2026-02-13*
