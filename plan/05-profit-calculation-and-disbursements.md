# Sprint 5: Profit Calculation & Disbursements

## Goal
Implement the profit calculation engine and disbursement recording system. Users can view calculated profit for any period, see each shareholder's share, and record disbursement withdrawals that reduce the available profit pool.

## Demo Criteria
- Navigate to `/disbursements` and see a profit summary for the selected period
- View each shareholder's calculated profit share
- Record a disbursement for a shareholder
- See disbursement history
- Available profit updates after disbursements
- Period-based filtering (month, quarter, year)
- All UI in Arabic

---

## Tasks

### Task 5.1 — Convex query: calculate profit for a period
**File(s):** `convex/profit.ts`

- Create a `getProfitSummary` query accepting: `dateFrom` (number), `dateTo` (number)
- Calculate: total income (sum of all income transactions in range)
- Calculate: total expenses (sum of all expense transactions in range)
- Calculate: net profit = total income - total expenses
- Calculate: total disbursements in the period
- Calculate: available profit = net profit - total disbursements in period
- Return: `{ totalIncome, totalExpenses, netProfit, totalDisbursements, availableProfit }`
- Require authenticated user

**Validation:** With income of 10,000, expenses of 4,000, and disbursements of 2,000 in the period, returns `{ totalIncome: 10000, totalExpenses: 4000, netProfit: 6000, totalDisbursements: 2000, availableProfit: 4000 }`.

---

### Task 5.2 — Convex query: get shareholder profit shares
**File(s):** `convex/profit.ts`

- Create a `getShareholderShares` query accepting: `dateFrom` (number), `dateTo` (number)
- For each active shareholder, calculate: `shareAmount = netProfit * (sharePercentage / 100)`
- Also calculate total disbursements per shareholder in the period
- Return array of: `{ shareholderId, shareholderName, sharePercentage, shareAmount, disbursed, remaining }`
- Where `remaining = shareAmount - disbursed`

**Validation:** Shareholder with 50% ownership, net profit 10,000, and 2,000 already disbursed returns `{ shareAmount: 5000, disbursed: 2000, remaining: 3000 }`.

---

### Task 5.3 — Convex query: list disbursements
**File(s):** `convex/disbursements.ts`

- Create a `list` query accepting: optional `dateFrom`, optional `dateTo`, optional `shareholderId`, optional `period` (string like "2026-Q1")
- Return disbursements ordered by date descending
- Include shareholder name (join/lookup) in the result
- Require authenticated user

**Validation:** Query returns disbursements filtered by provided parameters; shareholder name is included.

---

### Task 5.4 — Convex mutation: create disbursement
**File(s):** `convex/disbursements.ts`

- Create a `create` mutation accepting: `shareholderId`, `amount`, `date`, `period`, optional `notes`
- Validate: `amount` > 0
- Validate: `shareholderId` references an active shareholder
- Validate: disbursement amount does not exceed the shareholder's remaining share for the period
- Set `createdBy` to authenticated user, `createdAt` to `Date.now()`

**Validation:** Cannot create a disbursement exceeding the shareholder's remaining share; valid disbursement is persisted; available profit decreases.

---

### Task 5.5 — Convex mutation: delete disbursement
**File(s):** `convex/disbursements.ts`

- Create a `remove` mutation accepting `id`
- Hard delete the disbursement record
- Verify the disbursement exists

**Validation:** Deleting a disbursement restores the available profit for the shareholder and period.

---

### Task 5.6 — Period selector component
**File(s):** `src/lib/components/filters/PeriodSelector.svelte`

- Reusable component for selecting profit calculation period
- Options: هذا الشهر (This Month), هذا الربع (This Quarter), هذا العام (This Year), نطاق مخصص (Custom Range)
- Quarter options: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec)
- Emits `dateFrom`, `dateTo`, and `periodLabel` (e.g., "2026-Q1")

**Validation:** Selecting "This Quarter" correctly calculates start/end dates for the current quarter.

---

### Task 5.7 — Disbursements page: profit summary section
**File(s):** `src/routes/(app)/disbursements/+page.svelte`, `src/lib/components/disbursements/ProfitSummary.svelte`

- Replace placeholder page with real implementation
- Top section: Period selector
- Metric cards row showing: إجمالي الإيرادات (Total Income), إجمالي المصروفات (Total Expenses), صافي الربح (Net Profit), الأرباح المتاحة للتوزيع (Available Profit)
- Data sourced from `profit.getProfitSummary` query
- Cards styled with shadcn-svelte, amounts formatted with `formatCurrency`

**Validation:** Metrics update when period is changed; amounts are accurate based on transaction data.

---

### Task 5.8 — Disbursements page: shareholder shares table
**File(s):** `src/lib/components/disbursements/ShareholderSharesTable.svelte`

- Table below the profit summary showing each shareholder's allocation
- Columns: Shareholder Name, Percentage, Share Amount, Disbursed, Remaining, Actions
- "Remaining" shows how much the shareholder can still withdraw
- If remaining is 0, the row is grayed out
- "توزيع" (Distribute) button in actions column to initiate a disbursement for that shareholder

**Validation:** Table shows correct calculations; distribute button is disabled when remaining is 0.

---

### Task 5.9 — Disbursements page: create disbursement dialog
**File(s):** `src/lib/components/disbursements/CreateDisbursementDialog.svelte`

- Dialog opened from "Distribute" button in shareholder shares table
- Pre-filled with shareholder name (read-only) and period
- Fields: Amount (with max = remaining share), Date, Notes (optional)
- Validate amount does not exceed remaining
- On submit: call `disbursements.create`
- Toast success/error

**Validation:** Cannot enter amount exceeding remaining; successful disbursement updates the shares table and profit summary in real-time.

---

### Task 5.10 — Disbursements page: disbursement history table
**File(s):** `src/lib/components/disbursements/DisbursementHistory.svelte`

- Below the shareholder shares section
- Table showing all disbursements for the selected period
- Columns: Date, Shareholder, Amount, Period, Notes, Actions (delete)
- Delete button with `AlertDialog` confirmation
- Filterable by shareholder

**Validation:** Disbursement history shows all recorded disbursements; deleting one updates profit calculations.
