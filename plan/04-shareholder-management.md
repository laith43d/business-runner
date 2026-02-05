# Sprint 4: Shareholder Management

## Goal
Implement shareholder CRUD with ownership percentage tracking and the critical business rule that all active shareholders' percentages must total exactly 100%.

## Demo Criteria
- Navigate to `/shareholders` and see a list/grid of shareholders with their ownership percentages
- Add a new shareholder with name, email, and percentage
- Edit shareholder information
- Deactivate a shareholder
- Percentage validation: cannot save if active shareholders don't total 100%
- Visual indicator showing total percentage and remaining allocation
- All UI in Arabic

---

## Tasks

### Task 4.1 — Convex query: list shareholders
**File(s):** `convex/shareholders.ts`

- Create a `list` query returning all shareholders where `isActive === true`, ordered by `name`
- Create a `listAll` query returning all shareholders including inactive
- Create a `getById` query returning a single shareholder by ID
- All require authenticated user

**Validation:** Queries return correct data; inactive shareholders excluded from `list` but included in `listAll`.

---

### Task 4.2 — Convex query: get total share percentage
**File(s):** `convex/shareholders.ts`

- Create a `getTotalPercentage` query that sums `sharePercentage` for all active shareholders
- Returns `{ total: number, remaining: number }` where `remaining = 100 - total`

**Validation:** With shareholders at 40%, 35%, returns `{ total: 75, remaining: 25 }`.

---

### Task 4.3 — Convex mutation: create shareholder
**File(s):** `convex/shareholders.ts`

- Create a `create` mutation accepting: `name` (string), `email` (string), `sharePercentage` (number)
- Validate: `name` non-empty, `email` is valid format, `sharePercentage` > 0 and <= 100
- Validate: new percentage + existing active total must not exceed 100
- Set `isActive: true`, `createdAt` and `updatedAt` to `Date.now()`
- Require authenticated user

**Validation:** Creating a shareholder that would push total over 100% returns a ConvexError with Arabic message.

---

### Task 4.4 — Convex mutation: update shareholder
**File(s):** `convex/shareholders.ts`

- Create an `update` mutation accepting: `id`, optional `name`, `email`, `sharePercentage`
- If `sharePercentage` is changed, validate that new total (excluding this shareholder's old value) doesn't exceed 100
- Update `updatedAt` timestamp

**Validation:** Updating percentage respects the 100% cap (recalculated excluding the shareholder being edited).

---

### Task 4.5 — Convex mutation: deactivate shareholder
**File(s):** `convex/shareholders.ts`

- Create a `deactivate` mutation accepting `id`
- Set `isActive: false`
- Note: deactivating frees up their percentage allocation

**Validation:** After deactivation, `getTotalPercentage` reflects the reduced total.

---

### Task 4.6 — Shareholders page: card grid display
**File(s):** `src/routes/(app)/shareholders/+page.svelte`, `src/lib/components/shareholders/ShareholderCard.svelte`

- Replace placeholder with real page
- Header: "الشركاء" (Shareholders) with "إضافة شريك" (Add Shareholder) button
- Display shareholders in a card grid layout using shadcn-svelte `Card`
- Each card shows: Name, Email, Percentage (large, prominent), Status badge
- Above the grid: a summary bar showing "إجمالي النسب: X%" and "المتبقي: Y%" with a progress bar
- If total is 100%, progress bar is green; if under, yellow; if somehow over (edge case), red

**Validation:** Cards display correctly; summary bar shows accurate totals; responsive grid on mobile.

---

### Task 4.7 — Shareholders page: create shareholder dialog
**File(s):** `src/lib/components/shareholders/CreateShareholderDialog.svelte`

- Dialog form with fields: Name (required), Email (required, email validation), Share Percentage (required, number, 0-100)
- Show remaining percentage as helper text: "النسبة المتاحة: X%"
- Disable submit if percentage would exceed remaining
- On submit: call `shareholders.create`, close dialog, show toast

**Validation:** Cannot submit percentage that exceeds remaining; successful creation adds a card to the grid.

---

### Task 4.8 — Shareholders page: edit shareholder dialog
**File(s):** `src/lib/components/shareholders/EditShareholderDialog.svelte`

- Edit button on each card opens pre-populated dialog
- Same fields and validation as create
- Remaining percentage calculation accounts for the current shareholder's existing percentage
- On submit: call `shareholders.update`

**Validation:** Editing a shareholder from 30% to 50% is allowed if remaining (excluding their 30%) permits it.

---

### Task 4.9 — Shareholders page: deactivate shareholder with confirmation
**File(s):** `src/lib/components/shareholders/ShareholderCard.svelte`

- Delete/deactivate button on each card
- `AlertDialog` confirmation with warning that this will free up their percentage
- On confirm: call `shareholders.deactivate`
- Card disappears, summary bar updates

**Validation:** Deactivating a 30% shareholder changes remaining from 0% to 30% (or equivalent).
