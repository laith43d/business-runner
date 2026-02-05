# Sprint 2: Expense Categories CRUD

## Goal
Implement full CRUD (create, read, update, delete/deactivate) for expense categories — the simplest domain entity. This establishes patterns for Convex functions, form handling, data tables, and UI conventions that all future sprints will follow.

## Demo Criteria
- Navigate to `/categories` and see a table of all expense categories
- Create a new category via a dialog form
- Edit an existing category inline or via dialog
- Deactivate a category (soft delete) — it disappears from active list but remains in DB
- Real-time: opening two browser tabs shows changes instantly in both
- All UI in Arabic

---

## Tasks

### Task 2.1 — Convex query: list expense categories
**File(s):** `convex/expenseCategories.ts`

- Create a `list` query that returns all categories where `isActive === true`, ordered by `name`
- Create a `listAll` query (for admin/settings) that returns all categories including inactive
- Both queries require authenticated user (use auth helper)

**Validation:** Call query from Convex dashboard; returns seeded categories. Unauthenticated call returns auth error.

---

### Task 2.2 — Convex mutation: create expense category
**File(s):** `convex/expenseCategories.ts`

- Create a `create` mutation accepting `name` (string) and optional `description` (string)
- Validate: `name` must be non-empty and unique among active categories (case-insensitive)
- Set `isActive: true` and `createdAt: Date.now()`
- Require authenticated user

**Validation:** Mutation creates a new row; duplicate name returns a ConvexError; unauthenticated call fails.

---

### Task 2.3 — Convex mutation: update expense category
**File(s):** `convex/expenseCategories.ts`

- Create an `update` mutation accepting `id`, `name` (optional), `description` (optional)
- Validate: if `name` is provided, it must be unique among other active categories
- Only update provided fields

**Validation:** Mutation updates the specified fields; name uniqueness enforced.

---

### Task 2.4 — Convex mutation: deactivate expense category
**File(s):** `convex/expenseCategories.ts`

- Create a `deactivate` mutation accepting `id`
- Set `isActive: false` on the category
- Do NOT delete — soft delete pattern
- Require authenticated user

**Validation:** Category's `isActive` flips to `false`; it no longer appears in the `list` query results.

---

### Task 2.5 — Categories page: data table with list display
**File(s):** `src/routes/(app)/categories/+page.svelte`, `src/lib/components/categories/CategoriesTable.svelte`

- Replace the placeholder page with a real data table using shadcn-svelte `Table` component
- Display columns: Name, Description, Status (active badge), Actions
- Use the `list` (or `listAll`) Convex query with real-time subscription
- Show loading skeleton while data loads
- Empty state message if no categories exist

**Validation:** Page loads and displays seeded categories in a styled table with Arabic column headers.

---

### Task 2.6 — Categories page: create category dialog
**File(s):** `src/lib/components/categories/CreateCategoryDialog.svelte`

- "إضافة فئة" (Add Category) button opens a shadcn-svelte `Dialog`
- Form fields: Name (required), Description (optional) — using shadcn-svelte `Input` and `Textarea`
- Form validation: name required, show inline error messages in Arabic
- On submit: call the `create` mutation, close dialog on success, show toast on error
- Loading state on the submit button during mutation

**Validation:** Clicking the button opens the dialog; filling in a name and submitting adds a row to the table in real-time; duplicate name shows error toast.

---

### Task 2.7 — Categories page: edit category dialog
**File(s):** `src/lib/components/categories/EditCategoryDialog.svelte`

- Action column has an "تعديل" (Edit) button per row
- Opens a dialog pre-populated with the category's current name and description
- Same validation as create (name required, unique)
- On submit: call the `update` mutation

**Validation:** Edit button opens pre-filled dialog; changes are saved and reflected in the table immediately.

---

### Task 2.8 — Categories page: deactivate category with confirmation
**File(s):** `src/lib/components/categories/CategoriesTable.svelte`

- Action column has a "حذف" (Delete) button per row
- Clicking shows a shadcn-svelte `AlertDialog` confirmation: "هل أنت متأكد من حذف هذه الفئة؟"
- On confirm: call the `deactivate` mutation
- Row disappears from the table (real-time)

**Validation:** Delete button triggers confirmation; confirming removes the category from the active list.

---

### Task 2.9 — Toast notification system
**File(s):** `src/lib/components/ui/toaster.svelte`, `src/routes/(app)/+layout.svelte`

- Install and configure a toast/sonner component (shadcn-svelte has `sonner` integration)
- Create a reusable toast utility for success and error messages
- Wire into the app layout so toasts render globally
- All toast messages in Arabic

**Validation:** Successful create/edit/delete shows a green success toast; errors show a red error toast. Toasts auto-dismiss.
