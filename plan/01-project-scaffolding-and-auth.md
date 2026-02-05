# Sprint 1: Project Scaffolding, Convex Schema & Authentication

## Goal
Stand up the full project skeleton — SvelteKit app, Convex backend, Tailwind/shadcn-svelte styling, authentication flow — so that all future sprints build on a working, deployable foundation.

## Demo Criteria
- A running SvelteKit app at `localhost:5173` with Tailwind + shadcn-svelte styled pages
- Convex dev backend running with all tables defined
- User can sign up, log in, and log out
- Protected routes redirect unauthenticated users to login
- Arabic UI with RTL layout applied globally
- All code lints clean, types pass

---

## Tasks

### Task 1.1 — Initialize SvelteKit project
**File(s):** `package.json`, `svelte.config.js`, `tsconfig.json`, `vite.config.ts`

- Run `pnpm dlx sv create` to scaffold a SvelteKit project with TypeScript
- Verify `pnpm dev` starts without errors
- Verify `pnpm build` completes without errors

**Validation:** `pnpm dev` serves the default SvelteKit page; `pnpm build` exits 0.

---

### Task 1.2 — Install and configure Tailwind CSS
**File(s):** `tailwind.config.ts`, `src/app.css`, `postcss.config.js`

- Install Tailwind CSS v4, PostCSS, and autoprefixer
- Configure `tailwind.config.ts` with content paths for `.svelte` and `.ts` files
- Add Tailwind directives to `src/app.css`
- Verify utility classes render correctly in a test element

**Validation:** A `<div class="bg-blue-500 text-white p-4">test</div>` renders with blue background.

---

### Task 1.3 — Install and configure shadcn-svelte
**File(s):** `components.json`, `src/lib/components/ui/`

- Run `pnpm dlx shadcn-svelte@latest init`
- Configure with default theme, CSS variables, and `$lib/components/ui` alias
- Install Button and Card components as a smoke test: `pnpm dlx shadcn-svelte@latest add button card`
- Verify components render correctly

**Validation:** `<Button>Test</Button>` renders a styled button on the page.

---

### Task 1.4 — Set up global Arabic RTL layout
**File(s):** `src/app.html`, `src/app.css`, `tailwind.config.ts`

- Set `<html lang="ar" dir="rtl">` in `app.html`
- Add Arabic font family (e.g., IBM Plex Sans Arabic or Noto Sans Arabic via Google Fonts)
- Configure Tailwind `fontFamily` to use the Arabic font as default sans
- Add base RTL-friendly styles (text-align, margin/padding logical properties)

**Validation:** Page renders right-to-left; Arabic text displays in the configured font.

---

### Task 1.5 — Install and configure Convex
**File(s):** `convex/`, `src/lib/convex.ts`, `.env.local`, `package.json`

- Install `convex` and `convex-svelte` packages
- Run `pnpm convex dev` to initialize the Convex project and generate `convex/_generated/`
- Create `src/lib/convex.ts` with the Convex client setup for SvelteKit
- Wire the Convex client into the SvelteKit app (layout or provider)
- Verify connection to the Convex dev backend

**Validation:** `pnpm convex dev` runs; the SvelteKit app connects to Convex without errors in the console.

---

### Task 1.6 — Define Convex schema (all tables)
**File(s):** `convex/schema.ts`

- Define `transactions` table with fields: `type` (union "income"/"expense"), `amount` (number), `category` (optional string), `description` (string), `date` (number), `notes` (optional string), `createdBy` (id to users), `createdAt` (number), `updatedAt` (number)
- Define `expenseCategories` table: `name` (string), `description` (optional string), `isActive` (boolean), `createdAt` (number)
- Define `shareholders` table: `name` (string), `email` (string), `sharePercentage` (number), `isActive` (boolean), `createdAt` (number), `updatedAt` (number)
- Define `disbursements` table: `shareholderId` (id to shareholders), `amount` (number), `date` (number), `period` (string), `notes` (optional string), `createdBy` (id to users), `createdAt` (number)
- Add appropriate indexes: transactions by date, by type, by category; disbursements by shareholderId, by period

**Validation:** `pnpm convex dev` pushes schema without errors; tables visible in Convex dashboard.

---

### Task 1.7 — Implement authentication (Convex Auth with username/password)
**File(s):** `convex/auth.ts`, `convex/auth.config.ts`, `src/routes/login/+page.svelte`, `src/routes/signup/+page.svelte`

- Configure Convex Auth with the Password provider for username/password authentication
- Create login page at `/login` with username and password fields, styled with shadcn-svelte (Input, Button, Card)
- Create signup page at `/signup` with username, password, and confirm password fields
- Wire form submissions to Convex Auth sign-in/sign-up actions
- Display validation errors (empty fields, password mismatch, auth failures)
- All text in Arabic

**Validation:** User can create an account at `/signup`, then log in at `/login`; auth token is stored.

---

### Task 1.8 — Implement auth-protected layout and navigation shell
**File(s):** `src/routes/(app)/+layout.svelte`, `src/routes/(app)/+layout.ts`, `src/lib/components/Sidebar.svelte`, `src/lib/components/Header.svelte`

- Create a `(app)` route group for all authenticated pages
- In the group layout, check auth state; redirect to `/login` if not authenticated
- Build a sidebar navigation component with links to: Dashboard (`/`), Income (`/income`), Expenses (`/expenses`), Categories (`/categories`), Shareholders (`/shareholders`), Disbursements (`/disbursements`), Settings (`/settings`)
- Build a header component with app title and logout button
- All navigation labels in Arabic
- Responsive: sidebar collapses on mobile

**Validation:** Unauthenticated user is redirected to `/login`; authenticated user sees sidebar + header shell; logout button works.

---

### Task 1.9 — Create placeholder pages for all routes
**File(s):** `src/routes/(app)/+page.svelte`, `src/routes/(app)/income/+page.svelte`, `src/routes/(app)/expenses/+page.svelte`, `src/routes/(app)/categories/+page.svelte`, `src/routes/(app)/shareholders/+page.svelte`, `src/routes/(app)/disbursements/+page.svelte`, `src/routes/(app)/settings/+page.svelte`

- Create each page with a heading (Arabic) and placeholder text
- Each page should use the app layout (sidebar + header)
- Verify all routes are navigable from the sidebar

**Validation:** Clicking each sidebar link navigates to the corresponding page with a visible Arabic heading.

---

### Task 1.10 — Seed default expense categories
**File(s):** `convex/seed.ts` (or `convex/expenseCategories.ts`)

- Create a Convex mutation `seedDefaultCategories` that inserts the default categories: إيجار (Rent), مرافق (Utilities), رواتب (Salaries), تسويق (Marketing), مستلزمات (Supplies), تشغيل (Operations), متفرقات (Miscellaneous)
- Only seed if the categories table is empty (idempotent)
- Can be triggered from Convex dashboard or a dev-only endpoint

**Validation:** Running the seed mutation populates the `expenseCategories` table with 7 rows; running it again does not duplicate.
