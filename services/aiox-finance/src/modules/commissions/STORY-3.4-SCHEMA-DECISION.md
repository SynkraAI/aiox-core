# Story 3.4 — Schema Decision: `movements` table for commission approvals

**Status:** RECOMMENDATION READY
**Author:** Dex (Builder)
**Date:** 2026-05-14
**Story:** [3.4 — Commission Approval Workflow](../../../../../docs/stories/3.4-commission-approval.story.md)

---

## 1. Current Schema (as of migration 012)

### `movements` (migration 007)

```sql
CREATE TABLE public.movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id),  -- requires account
  type VARCHAR(20) CHECK (type IN ('DEBIT', 'CREDIT')),     -- only 2 values
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  reference_id UUID,                                         -- generic FK (no constraint)
  balance_after DECIMAL(15, 2),                              -- requires balance tracking
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
SELECT/INSERT: ADMIN | FINANCEIRO only
UPDATE: BLOCKED (immutable ledger — policy USING FALSE)
DELETE: implicit (no policy)
```

### `accounts` (migration 006)

```sql
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  account_type VARCHAR(20) CHECK IN ('CHECKING', 'SAVINGS', 'INVESTMENT'),
  account_number TEXT UNIQUE NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(20) CHECK IN ('ACTIVE', 'INACTIVE', 'FROZEN'),
  ...
);
```

### `commissions` (migration 005 + trigger 011)

```sql
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES sales(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15, 2) NOT NULL,
  percentage DECIMAL(5, 2),
  status VARCHAR(20) CHECK IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID'),
  approved_by UUID REFERENCES users(id),
  created_at, updated_at
);
-- UPDATE allowed for ADMIN | FINANCEIRO
```

---

## 2. Story 3.4 Requirements vs Current Schema

| Story 3.4 needs                                          | Current `movements`                          | Gap                                      |
| -------------------------------------------------------- | -------------------------------------------- | ---------------------------------------- |
| `user_id` (seller)                                       | Has `account_id` (which links to `user_id`)  | Indirection: needs JOIN to find seller   |
| `movement_type='COMMISSION_CREDIT'`                      | Has `type` ∈ `{DEBIT, CREDIT}`               | Type enum too coarse                     |
| `status='PENDING'` (awaiting payout)                     | NO `status` column                           | Missing column                           |
| `related_commission_id` FK to commissions                | Has generic `reference_id` (no FK)           | Missing typed FK                         |
| Approval date / approved_by                              | Not in movements (in commissions)            | Acceptable — commission tracks this      |
| Movement inserted by service (no balance_after baseline) | `balance_after` populated from `accounts`    | Forces account model on commission flow  |
| UPDATE for state transitions (PENDING → PAID)            | UPDATE = FALSE (immutable)                   | **HARD BLOCKER** — RLS forbids any UPDATE |

**Critical conflict:** Story 3.4 expects movements with mutable `status` (PENDING → PAID later in Story 3.5 payout), but current `movements` RLS makes the table an **immutable append-only ledger**.

---

## 3. Design Options

### Option A — Extend `movements` table (Story spec literal)

Add columns + relax RLS to match Story 3.4 AC5/AC6 verbatim.

**Migration 013 (proposed):**

```sql
-- A.1: Make account_id nullable (commissions have no account until payout)
ALTER TABLE public.movements
  ALTER COLUMN account_id DROP NOT NULL;

-- A.2: Replace `type` enum with broader `movement_type`
ALTER TABLE public.movements
  ADD COLUMN movement_type VARCHAR(30)
  CHECK (movement_type IN (
    'DEBIT', 'CREDIT',
    'COMMISSION_CREDIT', 'COMMISSION_PAYOUT',
    'GATEWAY_FEE', 'ADJUSTMENT'
  ));

-- Backfill from old type column
UPDATE public.movements SET movement_type = type WHERE movement_type IS NULL;

-- A.3: Add status for lifecycle tracking
ALTER TABLE public.movements
  ADD COLUMN status VARCHAR(20) DEFAULT 'POSTED'
  CHECK (status IN ('PENDING', 'POSTED', 'PAID', 'REVERSED', 'CANCELLED'));

-- A.4: Add direct user_id (denormalized for query speed + RLS)
ALTER TABLE public.movements
  ADD COLUMN user_id UUID REFERENCES public.users(id);

-- A.5: Add typed FK to commissions
ALTER TABLE public.movements
  ADD COLUMN related_commission_id UUID REFERENCES public.commissions(id);

-- A.6: Relax RLS — allow controlled UPDATE
DROP POLICY "Movements no updates" ON public.movements;
CREATE POLICY "Movements update admin or financeiro" ON public.movements
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO')
  );

-- A.7: Sellers can see their own commission-related movements
DROP POLICY "Movements visibility admin or financeiro" ON public.movements;
CREATE POLICY "Movements visibility role-aware" ON public.movements
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO') OR
    auth.uid() = user_id
  );

-- A.8: Indexes for new columns
CREATE INDEX idx_movements_user_id ON public.movements(user_id);
CREATE INDEX idx_movements_status ON public.movements(status);
CREATE INDEX idx_movements_related_commission_id ON public.movements(related_commission_id);
CREATE INDEX idx_movements_movement_type ON public.movements(movement_type);
```

**Pros:**
- Matches Story 3.4 AC5/AC6 word-for-word
- Single ledger table (simpler mental model)
- Story 3.5 (payout) can use same table with `COMMISSION_PAYOUT` type

**Cons:**
- **Breaks immutable-ledger invariant** (Article V — Quality First risk): if `movements` is the financial source of truth, allowing UPDATE introduces audit-trail integrity concerns
- Schema becomes dual-purpose: real account ledger (account_id, balance_after) + commission state machine (user_id, status, related_commission_id) — half the columns nullable in each path
- `accounts` table becomes optional → cascading nullability in downstream queries
- Existing migration 007 RLS test (`expect UPDATE to fail`) will break

---

### Option B — New `commission_movements` table (separation of concerns)

Create a dedicated table for commission lifecycle, leaving `movements` as the pure accounting ledger.

**Migration 013 (proposed):**

```sql
CREATE TABLE public.commission_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commission_id UUID NOT NULL REFERENCES public.commissions(id),
  user_id UUID NOT NULL REFERENCES public.users(id),         -- seller
  amount DECIMAL(15, 2) NOT NULL,
  movement_type VARCHAR(30) NOT NULL
    CHECK (movement_type IN ('COMMISSION_CREDIT', 'COMMISSION_PAYOUT', 'COMMISSION_REVERSAL')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PAID', 'CANCELLED', 'REVERSED')),
  description TEXT,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payout_movement_id UUID REFERENCES public.movements(id),   -- link to real ledger entry on payout
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.commission_movements ENABLE ROW LEVEL SECURITY;

-- SELECT: ADMIN/FINANCEIRO see all, seller sees own
CREATE POLICY "commission_movements visibility" ON public.commission_movements
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO', 'GESTOR') OR
    auth.uid() = user_id
  );

-- INSERT/UPDATE: ADMIN/FINANCEIRO only
CREATE POLICY "commission_movements insert" ON public.commission_movements
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO')
  );

CREATE POLICY "commission_movements update" ON public.commission_movements
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO')
  );

-- Unique: one CREDIT movement per commission
CREATE UNIQUE INDEX idx_commission_movements_credit_unique
  ON public.commission_movements(commission_id)
  WHERE movement_type = 'COMMISSION_CREDIT';

CREATE INDEX idx_commission_movements_user_id ON public.commission_movements(user_id);
CREATE INDEX idx_commission_movements_status ON public.commission_movements(status);
CREATE INDEX idx_commission_movements_commission_id ON public.commission_movements(commission_id);
```

**Pros:**
- **Preserves `movements` immutability** (Article V — financial integrity)
- Clear separation: `commission_movements` = lifecycle/state, `movements` = posted accounting facts
- Story 3.5 payout: insert a real (immutable) `movements` row AND update `commission_movements.status = 'PAID'` + `payout_movement_id` — preserves both audit invariants
- No nullable explosion in `movements`
- Existing RLS tests for `movements` continue to pass unchanged
- Easier to evolve commission state machine without polluting ledger

**Cons:**
- Deviation from Story 3.4 AC5 literal wording ("create record in movements table" — actual table name differs)
- One extra table, one extra service (small)
- Slight rewording of AC5/AC6 needed: "create record in commission_movements table"

---

## 4. Recommendation: **Option B — `commission_movements`**

### Why

1. **Article V (Quality First) — financial integrity.** The `movements` table was designed (migration 007) as an immutable append-only ledger. Relaxing that to support PENDING/PAID state transitions undermines its purpose as the system-of-record. In financial systems, you don't mutate ledger entries — you post compensating entries. Option B preserves this; Option A breaks it.

2. **Conceptual clarity.** Commissions go through approval workflow (PENDING → APPROVED → PAID/REJECTED) which is a **business state machine**. Accounting ledger entries are **atomic, immutable facts**. Conflating them in one table forces half the columns to be nullable on each path and leaks workflow concerns into the ledger.

3. **Story 3.5 compatibility.** On payout, Option B writes:
   - `INSERT INTO movements (account_id, type='CREDIT', amount, reference_id=commission_id, balance_after=...)` — real ledger fact
   - `UPDATE commission_movements SET status='PAID', payout_movement_id=<id>` — workflow transition
   Both invariants preserved: ledger stays immutable, workflow stays mutable.

4. **Test stability.** Migration 007 RLS test asserts `UPDATE` on `movements` fails. Option A breaks this test; Option B keeps it intact (the test verified the **design intent**).

5. **AC drift is minimal.** Story 3.4 AC5/AC6 literal text says "movements table" but the **functional intent** is "a record of the commission credit movement linked to the commission." The PO should accept renaming to `commission_movements` — it's a clarifying refinement, not a scope change. Recommend updating AC5/AC6 wording during Story 3.4 implementation kickoff.

### Tradeoffs accepted

- One extra table (low cost — single migration, single small NestJS module)
- AC5/AC6 wording adjustment required (PO sign-off, ~5 min)
- Two writes on payout instead of one update (negligible — both inside a single Supabase RPC/transaction)

---

## 5. SQL Migrations Required (Option B)

### `013_commission_movements.sql` (new file)

```sql
-- Migration 013: Commission Movements Lifecycle Table + RLS
-- Purpose: track commission approval lifecycle (PENDING -> PAID/CANCELLED)
-- Keeps movements table immutable (financial ledger invariant)

CREATE TABLE public.commission_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commission_id UUID NOT NULL REFERENCES public.commissions(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  movement_type VARCHAR(30) NOT NULL
    CHECK (movement_type IN ('COMMISSION_CREDIT', 'COMMISSION_PAYOUT', 'COMMISSION_REVERSAL')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PAID', 'CANCELLED', 'REVERSED')),
  description TEXT,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payout_movement_id UUID REFERENCES public.movements(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.commission_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commission_movements visibility" ON public.commission_movements
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO', 'GESTOR') OR
    auth.uid() = user_id
  );

CREATE POLICY "commission_movements insert" ON public.commission_movements
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO')
  );

CREATE POLICY "commission_movements update" ON public.commission_movements
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO')
  );

-- One CREDIT per commission (idempotency)
CREATE UNIQUE INDEX idx_commission_movements_credit_unique
  ON public.commission_movements(commission_id)
  WHERE movement_type = 'COMMISSION_CREDIT';

COMMENT ON INDEX idx_commission_movements_credit_unique IS
  'One COMMISSION_CREDIT per commission row. Recurring commissions (Story 3.5) generate N commission rows (occurrence_number), each gets its own credit movement.';

CREATE INDEX idx_commission_movements_user_id ON public.commission_movements(user_id);
CREATE INDEX idx_commission_movements_status ON public.commission_movements(status);
CREATE INDEX idx_commission_movements_commission_id ON public.commission_movements(commission_id);
CREATE INDEX idx_commission_movements_movement_type ON public.commission_movements(movement_type);

-- Updated_at trigger (reuse existing helper if present, else inline)
CREATE OR REPLACE FUNCTION public.set_commission_movements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_commission_movements_updated_at
BEFORE UPDATE ON public.commission_movements
FOR EACH ROW EXECUTE FUNCTION public.set_commission_movements_updated_at();

-- STATUS TRANSITION GUARD (prevents invalid state machine transitions)
CREATE OR REPLACE FUNCTION public.validate_commission_movement_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'PAID' AND NEW.status NOT IN ('PAID', 'REVERSED') THEN
    RAISE EXCEPTION 'Invalid transition: PAID can only go to REVERSED';
  END IF;
  IF OLD.status = 'CANCELLED' AND NEW.status != 'CANCELLED' THEN
    RAISE EXCEPTION 'Invalid transition: CANCELLED is terminal';
  END IF;
  IF OLD.status = 'REVERSED' AND NEW.status != 'REVERSED' THEN
    RAISE EXCEPTION 'Invalid transition: REVERSED is terminal';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_commission_movements_transition
BEFORE UPDATE OF status ON public.commission_movements
FOR EACH ROW EXECUTE FUNCTION public.validate_commission_movement_transition();
```

### No changes to `movements` (migration 007 remains intact)

---

## 6. Story 3.5 Compatibility Notes

Story 3.5 (Recurring Commission Processing) lines that reference movements:
- **Line 385:** "Each approval still creates `movements` record" → should be `commission_movements`
- **Line 483:** "movements table has `related_commission_id`" → with Option B, linkage is `commission_movements → commissions → recurring_schedules`

**Action for SM/PO:** Update Story 3.5 wording in next refresh (cross-story alignment).

---

## 7. Implementation Impact on Story 3.4

| Task in Story 3.4                                        | Change vs spec                                       |
| -------------------------------------------------------- | ---------------------------------------------------- |
| Task 0 — schema check                                    | Replace "ALTER movements ADD related_commission_id" with migration 013 (new table) |
| Task 3 — Movements Service                               | Rename to `CommissionMovementsService` (or place in commissions module) |
| AC5/AC6 wording                                          | Update to "commission_movements table" (PO sign-off) |
| Tests                                                    | Test against `commission_movements`, not `movements` |
| Audit RLS tests (existing migration 007)                 | Unchanged — still assert UPDATE forbidden on `movements` |

---

## 8. Open Questions for PO/Architect

1. **AC5/AC6 wording:** approve rename `movements` → `commission_movements` in Story 3.4 AC?
2. **Account linkage on payout (Story 3.5):** when commission is paid, does the system require an existing `accounts` row for the seller, or does payout happen via external gateway (no internal account)?
3. **Idempotency:** unique index ensures one CREDIT per commission. Sufficient, or do we also need an event-sourcing-style ledger of state transitions?

---

## 9. Decision Log

- **2026-05-14 — Dex:** Recommendation = **Option B (commission_movements)**. Reason: preserve `movements` immutability per Article V (financial integrity). AC5/AC6 wording deviation flagged for PO sign-off.
- **2026-05-14 — Aria:** Tweaks applied — status transition guard trigger (§5), unique index COMMENT + Story 3.5 wording flags (§6), audit logging contract (§10).

---

## 10. Audit Logging Contract

Every `commission_movements` state transition MUST emit an `audit_log` entry via `AuditLoggerService.log()`.

**Required actions:**
- `approve` → log `action='COMMISSION_APPROVED'`, `table_name='commission_movements'`, `old_values={status: 'PENDING'}`, `new_values={status: 'APPROVED', approved_by, approval_date}`
- `reject` → log `action='COMMISSION_REJECTED'`, `new_values={status: 'REJECTED', rejected_by, rejection_reason}`
- `payout` → log `action='COMMISSION_PAID'`, `new_values={status: 'PAID', paid_date, paid_amount}`

**Implementation pattern** (from Story 3.3):
```typescript
await this.auditLogger.logAction({
  userId: currentUser.id,
  action: 'COMMISSION_APPROVED',
  tableName: 'commission_movements',
  recordId: movementId,
  oldValues: { status: 'PENDING' },
  newValues: { status: 'APPROVED', approved_by, approval_date },
});
```

This ensures full traceability per Article V (Quality First) + Story 1.5 audit invariants.

---

**Next step:** PO/Architect review this doc → approve Option A or B → Story 3.4 unblocks for implementation.
