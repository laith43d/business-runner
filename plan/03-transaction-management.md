# Sprint 3: Transaction Management (Income & Expenses)

## Goal
Implement the core transaction system — adding, editing, deleting, listing, filtering, and searching both income and expense transactions. This is the central feature of the application.

## Demo Criteria
- Navigate to `/income` and add/edit/delete income transactions
- Navigate to `/expenses` and add/edit/delete expense transactions with category selection
- Filter transactions by date range, category (expenses), and amount
- Search transactions by description text
- Real-time updates across tabs
- All UI in Arabic

---

## Tasks

### Task 3.1 — Convex query: list transactions with filters
**File(s):** `convex/transactions.ts`

- Create a `list` query accepting: `type` ("income" | "expense"), optional `dateFrom` (number), optional `dateTo` (number), optional `category` (string), optional `searchText` (string)
- Use indexes for efficient filtering by type + date range
- If `category` provided, further filter by category
- If `searchText` provided, filter by description containing text (case-insensitive)
- Order by date descending (most recent first)
- Require authenticated user
- Paginate results (return first 50, support cursor-based pagination)

**Validation:** Query returns correctly filtered results; index is used (check Convex dashboard query performance). Unauthenticated call fails.

---

### Task 3.2 — Convex mutation: create transaction
**File(s):** `convex/transactions.ts`

- Create a `create` mutation accepting: `type`, `amount`, `description`, `date`, optional `category`, optional `notes`
- Validate: `amount` > 0, `description` non-empty, `date` is a valid timestamp
- If `type === "expense"`, `category` is required and must reference an active expense category
- If `type === "income"`, `category` must be null/undefined
- Set `createdBy` to the authenticated user ID, `createdAt` and `updatedAt` to `Date.now()`

**Validation:** Income transaction created without category; expense transaction requires valid category; invalid data returns ConvexError.

---

### Task 3.3 — Convex mutation: update transaction
**File(s):** `convex/transactions.ts`

- Create an `update` mutation accepting: `id`, and optional fields: `amount`, `description`, `date`, `category`, `notes`
- Validate same rules as create for any provided field
- Update `updatedAt` timestamp
- Verify the transaction exists; return error if not found

**Validation:** Mutation updates specified fields; updatedAt changes; non-existent ID returns error.

---

### Task 3.4 — Convex mutation: delete transaction
**File(s):** `convex/transactions.ts`

- Create a `remove` mutation accepting `id`
- Hard delete the transaction record (per PRD — audit trail is noted but soft delete not specified for V1)
- Verify the transaction exists before deleting

**Validation:** Transaction is removed from the database; subsequent list query no longer includes it.

---

### Task 3.5 — Reusable TransactionForm component
**File(s):** `src/lib/components/transactions/TransactionForm.svelte`

- Build a form component that works for both income and expense types
- Props: `type` ("income" | "expense"), optional `initialData` (for edit mode)
- Fields: Amount (number input), Description (text input), Date (date picker — use shadcn-svelte date picker), Notes (optional textarea)
- For expenses only: Category dropdown populated from `expenseCategories.list` query
- Form validation with inline Arabic error messages
- Submit button with loading state
- Emits a `submit` event with validated form data

**Validation:** Form renders correctly for both types; category dropdown only shows for expenses; validation prevents submission of invalid data.

---

### Task 3.6 — Income page: transaction list and create flow
**File(s):** `src/routes/(app)/income/+page.svelte`, `src/lib/components/transactions/TransactionList.svelte`

- Replace placeholder with real page
- Header: "الإيرادات" (Income) with "إضافة إيراد" (Add Income) button
- Table columns: Date, Amount (formatted with currency), Description, Notes, Actions (edit/delete)
- "Add Income" button opens a dialog with `TransactionForm` in income mode
- On submit: call `transactions.create` with `type: "income"`
- Show success/error toast
- Real-time subscription to transaction list

**Validation:** Income entries appear in table after creation; amounts formatted correctly; table updates in real-time.

---

### Task 3.7 — Expenses page: transaction list and create flow
**File(s):** `src/routes/(app)/expenses/+page.svelte`

- Same structure as income page but for expenses
- Header: "المصروفات" (Expenses) with "إضافة مصروف" (Add Expense) button
- Table columns: Date, Amount, Category, Description, Actions
- "Add Expense" dialog uses `TransactionForm` in expense mode (shows category dropdown)
- On submit: call `transactions.create` with `type: "expense"`

**Validation:** Expense entries show category; category dropdown contains active categories from the DB.

---

### Task 3.8 — Edit transaction dialog
**File(s):** `src/lib/components/transactions/EditTransactionDialog.svelte`

- Action column "تعديل" (Edit) button opens a dialog with `TransactionForm` pre-populated
- On submit: call `transactions.update`
- Close dialog and show toast on success

**Validation:** Edit button opens pre-filled form; changes persist after submission.

---

### Task 3.9 — Delete transaction with confirmation
**File(s):** `src/lib/components/transactions/TransactionList.svelte`

- Action column "حذف" (Delete) button triggers `AlertDialog` confirmation
- On confirm: call `transactions.remove`
- Row disappears from table

**Validation:** Delete triggers confirmation; confirming removes the row.

---

### Task 3.10 — Date range filter component
**File(s):** `src/lib/components/filters/DateRangeFilter.svelte`

- Reusable date range picker component using shadcn-svelte
- Preset options: هذا الشهر (This Month), الشهر الماضي (Last Month), آخر 3 أشهر (Last 3 Months), آخر 6 أشهر (Last 6 Months), هذا العام (This Year), نطاق مخصص (Custom Range)
- Custom range shows two date pickers (from/to)
- Emits selected `dateFrom` and `dateTo` timestamps

**Validation:** Selecting a preset correctly calculates the date range; custom range allows arbitrary from/to selection.

---

### Task 3.11 — Wire filters into income and expense pages
**File(s):** `src/routes/(app)/income/+page.svelte`, `src/routes/(app)/expenses/+page.svelte`

- Add `DateRangeFilter` above the table on both pages
- Add a search input for description text search
- On expenses page: add category filter dropdown
- Filter state drives the Convex query parameters
- Changing filters updates the table in real-time

**Validation:** Selecting a date range, typing search text, or choosing a category correctly filters the displayed transactions.

---

### Task 3.12 — Amount formatting utility
**File(s):** `src/lib/utils/format.ts`

- Create a `formatCurrency(amount: number): string` utility
- Format as Arabic number with currency symbol (configurable, default "ر.س" for Saudi Riyal or generic)
- Create a `formatDate(timestamp: number): string` utility using Arabic locale
- Create a `formatDateRange(from: number, to: number): string` utility

**Validation:** `formatCurrency(1500.5)` returns properly formatted Arabic currency string; `formatDate(...)` returns Arabic date string.
