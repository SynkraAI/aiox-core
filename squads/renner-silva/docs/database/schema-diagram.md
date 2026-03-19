# Database Schema Diagram - Metodo Aplauda de Pe

**Version:** 1.0
**Date:** 2026-02-13
**Parent:** `docs/architecture/architecture.md` Section 5
**SQL Reference:** `docs/database/schema.sql`

---

## Entity Relationship Diagram (ASCII)

```
+--------------------+          +--------------------+
|    auth.users      |          |      badges        |
+--------------------+          +--------------------+
| id (UUID) PK       |          | id (TEXT) PK       |
| email              |          | name               |
| raw_user_meta_data |          | description        |
| ...                |          | icon               |
+--------+-----------+          | criteria_type      |
         |                      | criteria_value     |
         | 1:1 (trigger)        | rarity             |
         |                      | sort_order         |
         v                      +--------+-----------+
+--------------------+                   |
|     profiles       |                   |
+--------------------+                   |
| id (UUID) PK/FK    +------+           |
| email              |      |           |
| name               |      |           |
| avatar_url         |      |           |
| role               |      |           |
| learning_path_id   |      |           |
| timezone           |      |           |
| created_at         |      |           |
| updated_at         |      |           |
+--------------------+      |           |
         |                   |           |
         | 1:N               | 1:N       | N:M
         |                   |           |
         v                   v           v
+--------------------+ +--------------------+
|     progress       | |   user_badges      |
+--------------------+ +--------------------+
| id (UUID) PK       | | id (UUID) PK       |
| user_id (FK)       | | user_id (FK)       |
| checkpoint_id      | | badge_id (FK)      |
| module_id          | | earned_at          |
| completed          | +--------------------+
| completed_at       |         UQ(user_id, badge_id)
| created_at         |
| updated_at         |
+--------------------+
  UQ(user_id, checkpoint_id)
         |
         | (same user_id FK)
         |
+--------------------+  +--------------------+  +--------------------+
|      notes         |  |   quiz_results     |  |     streaks        |
+--------------------+  +--------------------+  +--------------------+
| id (UUID) PK       |  | id (UUID) PK       |  | id (UUID) PK       |
| user_id (FK)       |  | user_id (FK)       |  | user_id (FK) UQ    |
| entity_type        |  | module_id          |  | current_streak     |
| entity_id          |  | score              |  | longest_streak     |
| content            |  | total_questions    |  | last_activity_date |
| created_at         |  | correct_answers    |  | freeze_available   |
| updated_at         |  | grade              |  | freeze_used_at     |
+--------------------+  | time_spent_seconds |  | updated_at         |
                        | answers (JSONB)    |  +--------------------+
                        | attempted_at       |
                        | created_at         |
                        +--------------------+
```

---

## Table Relationship Summary

| From | To | Type | FK Column | ON DELETE |
|------|----|------|-----------|----------|
| `profiles` | `auth.users` | 1:1 | `profiles.id` = `auth.users.id` | CASCADE |
| `progress` | `profiles` | N:1 | `progress.user_id` | CASCADE |
| `notes` | `profiles` | N:1 | `notes.user_id` | CASCADE |
| `user_badges` | `profiles` | N:1 | `user_badges.user_id` | CASCADE |
| `user_badges` | `badges` | N:1 | `user_badges.badge_id` | CASCADE |
| `quiz_results` | `profiles` | N:1 | `quiz_results.user_id` | CASCADE |
| `streaks` | `profiles` | 1:1 | `streaks.user_id` | CASCADE |

---

## Table Details

### profiles

| Column | Type | Constraints | Default | Notes |
|--------|------|------------|---------|-------|
| `id` | UUID | PK, FK(auth.users) | -- | Same as auth.users.id |
| `email` | TEXT | NOT NULL | -- | From auth.users |
| `name` | TEXT | -- | -- | From OAuth or manual entry |
| `avatar_url` | TEXT | -- | -- | From OAuth or Supabase Storage |
| `role` | user_role | NOT NULL | 'student' | ENUM: student, instructor |
| `learning_path_id` | TEXT | -- | NULL | e.g., 'trilha-iniciante' |
| `timezone` | TEXT | -- | 'America/Sao_Paulo' | For streak date calculation |
| `created_at` | TIMESTAMPTZ | NOT NULL | NOW() | -- |
| `updated_at` | TIMESTAMPTZ | NOT NULL | NOW() | Auto-updated via trigger |

**Indexes:** `idx_profiles_email`, `idx_profiles_role`
**RLS:** SELECT own, UPDATE own (name, avatar_url, learning_path_id, timezone)

### progress

| Column | Type | Constraints | Default | Notes |
|--------|------|------------|---------|-------|
| `id` | UUID | PK | uuid_generate_v4() | -- |
| `user_id` | UUID | NOT NULL, FK(profiles) | -- | ON DELETE CASCADE |
| `checkpoint_id` | TEXT | NOT NULL | -- | e.g., 'cp-1.1' |
| `module_id` | TEXT | NOT NULL | -- | Denormalized for query performance |
| `completed` | BOOLEAN | NOT NULL | TRUE | FALSE if user unchecks |
| `completed_at` | TIMESTAMPTZ | NOT NULL | NOW() | -- |
| `created_at` | TIMESTAMPTZ | NOT NULL | NOW() | -- |
| `updated_at` | TIMESTAMPTZ | NOT NULL | NOW() | Auto-updated via trigger |

**Unique:** `(user_id, checkpoint_id)`
**Indexes:** `idx_progress_user_module`, `idx_progress_user_completed_at`, `idx_progress_checkpoint`, `idx_progress_module`
**RLS:** Full CRUD on own data

### notes

| Column | Type | Constraints | Default | Notes |
|--------|------|------------|---------|-------|
| `id` | UUID | PK | uuid_generate_v4() | -- |
| `user_id` | UUID | NOT NULL, FK(profiles) | -- | ON DELETE CASCADE |
| `entity_type` | entity_type | NOT NULL | -- | ENUM: module, concept, exercise |
| `entity_id` | TEXT | NOT NULL | -- | ID of the attached entity |
| `content` | TEXT | NOT NULL | '' | Plain text or basic Markdown |
| `created_at` | TIMESTAMPTZ | NOT NULL | NOW() | -- |
| `updated_at` | TIMESTAMPTZ | NOT NULL | NOW() | Auto-updated via trigger |

**Indexes:** `idx_notes_user_entity`, `idx_notes_content_trgm` (full-text)
**RLS:** Full CRUD on own data

### badges

| Column | Type | Constraints | Default | Notes |
|--------|------|------------|---------|-------|
| `id` | TEXT | PK | -- | e.g., 'badge-primeiro-passo' |
| `name` | TEXT | NOT NULL | -- | Display name |
| `description` | TEXT | NOT NULL | -- | How to earn |
| `icon` | TEXT | NOT NULL | -- | Lucide icon name or SVG |
| `criteria_type` | TEXT | NOT NULL | -- | checkpoint, module, trail, streak, etc. |
| `criteria_value` | JSONB | NOT NULL | '{}' | Flexible criteria |
| `rarity` | badge_rarity | NOT NULL | 'common' | ENUM: common, rare, epic, legendary |
| `sort_order` | INT | NOT NULL | 0 | Display order |
| `created_at` | TIMESTAMPTZ | NOT NULL | NOW() | -- |

**RLS:** SELECT for all authenticated users. INSERT/UPDATE/DELETE admin only.

### user_badges

| Column | Type | Constraints | Default | Notes |
|--------|------|------------|---------|-------|
| `id` | UUID | PK | uuid_generate_v4() | -- |
| `user_id` | UUID | NOT NULL, FK(profiles) | -- | ON DELETE CASCADE |
| `badge_id` | TEXT | NOT NULL, FK(badges) | -- | ON DELETE CASCADE |
| `earned_at` | TIMESTAMPTZ | NOT NULL | NOW() | -- |

**Unique:** `(user_id, badge_id)`
**Indexes:** `idx_user_badges_user`, `idx_user_badges_badge`
**RLS:** SELECT own. INSERT server-only (prevent self-granting).

### quiz_results

| Column | Type | Constraints | Default | Notes |
|--------|------|------------|---------|-------|
| `id` | UUID | PK | uuid_generate_v4() | -- |
| `user_id` | UUID | NOT NULL, FK(profiles) | -- | ON DELETE CASCADE |
| `module_id` | TEXT | NOT NULL | -- | e.g., 'mod-1' |
| `score` | INT | NOT NULL, CHECK 0-100 | -- | Percentage |
| `total_questions` | INT | NOT NULL, CHECK >0 | -- | -- |
| `correct_answers` | INT | NOT NULL, CHECK >=0 | -- | -- |
| `grade` | quiz_grade | NOT NULL | -- | ENUM: excellent, good, review |
| `time_spent_seconds` | INT | -- | -- | Optional timing |
| `answers` | JSONB | NOT NULL | '[]' | Answer details |
| `attempted_at` | TIMESTAMPTZ | NOT NULL | NOW() | -- |
| `created_at` | TIMESTAMPTZ | NOT NULL | NOW() | -- |

**Indexes:** `idx_quiz_results_user_module`, `idx_quiz_results_score`
**RLS:** SELECT own, INSERT own, UPDATE own.

### streaks

| Column | Type | Constraints | Default | Notes |
|--------|------|------------|---------|-------|
| `id` | UUID | PK | uuid_generate_v4() | -- |
| `user_id` | UUID | NOT NULL, FK(profiles), UNIQUE | -- | ON DELETE CASCADE |
| `current_streak` | INT | NOT NULL | 0 | Current consecutive days |
| `longest_streak` | INT | NOT NULL | 0 | All-time record |
| `last_activity_date` | DATE | -- | -- | Last active date |
| `freeze_available` | BOOLEAN | NOT NULL | TRUE | 1 per week |
| `freeze_used_at` | DATE | -- | -- | When freeze last used |
| `updated_at` | TIMESTAMPTZ | NOT NULL | NOW() | Auto-updated via trigger |

**Unique:** `(user_id)` - one row per user
**RLS:** SELECT own. INSERT/UPDATE server-only (prevent manipulation).

---

## Data Volume Estimates (Free Tier Budget)

| Table | Rows per User | At 500 Users | Estimated Size |
|-------|--------------|-------------|---------------|
| `profiles` | 1 | 500 | ~50 KB |
| `progress` | ~29 (checkpoints) | 14,500 | ~1.5 MB |
| `notes` | ~5 (avg) | 2,500 | ~2.5 MB |
| `badges` | 15 (static) | 15 | ~2 KB |
| `user_badges` | ~5 (avg earned) | 2,500 | ~100 KB |
| `quiz_results` | ~10 (retakes) | 5,000 | ~5 MB |
| `streaks` | 1 | 500 | ~25 KB |
| **TOTAL** | | ~25,015 | **~9.2 MB** |

**Conclusion:** At 500 users with full usage, estimated database size is ~9.2 MB. Supabase free tier limit is 500 MB. Usage is **1.8% of limit**. No concern until ~25,000 active users.

---

## Database Functions Summary

| Function | Purpose | Called By | Returns |
|----------|---------|-----------|---------|
| `calculate_module_progress(user_id, module_id, total_checkpoints)` | Calculate % completion of a module | Application (client/server) | INT (0-100) |
| `check_unlock_next_module(user_id, module_id, total_checkpoints)` | Check if module N+1 should unlock | Application | BOOLEAN |
| `calculate_streak(user_id)` | Compute current and longest streak | Application / Edge Function | TABLE(current, longest) |
| `get_instructor_metrics()` | Aggregated student metrics | Instructor dashboard | JSONB |
| `get_best_quiz_scores(user_id)` | Best quiz score per module | Profile page | TABLE |

---

## Triggers Summary

| Trigger | Table | Event | Action |
|---------|-------|-------|--------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | Creates profile + streak record |
| `trg_profiles_updated_at` | `profiles` | BEFORE UPDATE | Sets `updated_at = NOW()` |
| `trg_progress_updated_at` | `progress` | BEFORE UPDATE | Sets `updated_at = NOW()` |
| `trg_notes_updated_at` | `notes` | BEFORE UPDATE | Sets `updated_at = NOW()` |
| `trg_streaks_updated_at` | `streaks` | BEFORE UPDATE | Sets `updated_at = NOW()` |

---

*Schema diagram generated by Aria (Architect Agent)*
*Version 1.0 - 2026-02-13*
