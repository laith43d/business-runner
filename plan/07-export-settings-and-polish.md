# Sprint 7: CSV Export, Settings, and Final Polish

## Goal
Complete the remaining features — CSV export, settings page, and comprehensive polish pass including accessibility, error handling, performance, and final QA to produce a production-ready V1.

## Demo Criteria
- Export transaction history to CSV from income and expenses pages
- Settings page with user account management
- All error states handled gracefully
- Consistent loading/empty states across all pages
- Full Arabic UI review — no untranslated strings
- Application works end-to-end: sign up → add categories → add transactions → manage shareholders → view dashboard → distribute profits → export data
- Clean build, no console errors

---

## Tasks

### Task 7.1 — CSV export: utility function
**File(s):** `src/lib/utils/export.ts`

- Create a `exportToCSV(data: Record<string, unknown>[], filename: string)` utility
- Convert array of objects to CSV string with proper escaping (commas, quotes, newlines in values)
- Use UTF-8 BOM for Arabic text compatibility in Excel
- Trigger browser download of the generated file
- Column headers should be in Arabic

**Validation:** Exporting `[{ المبلغ: 1000, الوصف: "إيراد أول" }]` generates a valid CSV file that opens correctly in Excel with Arabic text.

---

### Task 7.2 — Convex query: export transactions
**File(s):** `convex/transactions.ts`

- Create a `listForExport` query accepting: `type`, `dateFrom`, `dateTo`, optional `category`
- Returns ALL matching transactions (no pagination) with fields formatted for export
- Include: date (formatted), type label (Arabic), amount, category, description, notes
- Require authenticated user

**Validation:** Query returns all transactions in the range without pagination limits.

---

### Task 7.3 — Export button on income and expenses pages
**File(s):** `src/routes/(app)/income/+page.svelte`, `src/routes/(app)/expenses/+page.svelte`

- Add "تصدير CSV" (Export CSV) button next to the filters
- On click: fetch data using `listForExport` query with current filter params
- Call `exportToCSV` with the results
- Button shows loading spinner during export
- Disabled if no transactions match current filters

**Validation:** Clicking export downloads a CSV with the currently filtered transactions; file opens correctly.

---

### Task 7.4 — Settings page: user account section
**File(s):** `src/routes/(app)/settings/+page.svelte`

- Replace placeholder with real settings page
- Section: "الحساب" (Account) — display current username/email
- Section: "تغيير كلمة المرور" (Change Password) — form with current password, new password, confirm new password
- Wire password change to Convex Auth
- Show success/error toast

**Validation:** User can change password and log in with the new password.

---

### Task 7.5 — Global error boundary
**File(s):** `src/routes/+error.svelte`, `src/routes/(app)/+error.svelte`

- Create error pages for unhandled errors
- Display friendly Arabic error message: "حدث خطأ غير متوقع" (An unexpected error occurred)
- Show error code if available
- "العودة للرئيسية" (Back to Home) button
- Styled consistently with the app

**Validation:** Navigating to a non-existent route shows the error page; JavaScript errors are caught and displayed.

---

### Task 7.6 — Loading states audit
**File(s):** All page and component files

- Audit every page and component for loading states
- Ensure all Convex query subscriptions show a skeleton/spinner while loading
- Ensure all mutation-triggering buttons show loading state during execution
- Standardize loading patterns across the app (use consistent skeleton components)

**Validation:** No page flashes empty content before data loads; all buttons disable during mutations.

---

### Task 7.7 — Empty states audit
**File(s):** All page files

- Audit every data-driven page for empty states
- Income page with no income: "لم يتم تسجيل أي إيرادات بعد" + CTA button
- Expenses page with no expenses: "لم يتم تسجيل أي مصروفات بعد" + CTA button
- Shareholders page with no shareholders: "لم يتم إضافة أي شركاء بعد" + CTA button
- Disbursements page with no data: appropriate message
- Categories page with no categories: appropriate message

**Validation:** Each page with no data shows a helpful empty state with an action button.

---

### Task 7.8 — Arabic text review
**File(s):** All `.svelte` files

- Review every user-facing string in the application
- Ensure no English strings remain (except technical terms if appropriate)
- Verify Arabic grammar and phrasing is natural
- Check RTL alignment is correct on all pages
- Ensure numbers display correctly (can be Western Arabic numerals ١٢٣ or standard 123 — pick one and be consistent)

**Validation:** Complete walkthrough of the app shows all text in Arabic; no English strings visible to users.

---

### Task 7.9 — Responsive design audit
**File(s):** All page and layout files

- Test all pages at common breakpoints: 375px (mobile), 768px (tablet), 1024px (small desktop), 1440px (desktop)
- Verify sidebar collapses/hides on mobile with a hamburger menu toggle
- Verify tables are scrollable horizontally on small screens or switch to card layout
- Verify dialogs are properly sized on mobile
- Verify charts resize correctly

**Validation:** App is fully usable on mobile and desktop; no overflow/clipping issues.

---

### Task 7.10 — Accessibility audit
**File(s):** All component files

- Ensure all interactive elements have appropriate ARIA labels (in Arabic)
- Ensure form fields have associated labels
- Ensure color contrast meets WCAG AA standards
- Ensure keyboard navigation works: tab through forms, enter to submit, escape to close dialogs
- Ensure focus management: dialogs trap focus, closing returns focus to trigger

**Validation:** Tab through the entire app using keyboard only; screen reader announces elements correctly.

---

### Task 7.11 — Performance optimization
**File(s):** Various

- Review Convex queries for unnecessary data fetching
- Ensure indexes are used for all filtered queries (check `convex/schema.ts`)
- Add `key` props to all Svelte `{#each}` blocks for efficient DOM updates
- Lazy-load chart components (they're heavy) using dynamic imports
- Verify dashboard loads within 2 seconds (per success metric)

**Validation:** Dashboard load time < 2s; Convex dashboard shows queries using indexes; no unnecessary re-renders.

---

### Task 7.12 — End-to-end smoke test
**File(s):** N/A (manual or scripted test)

- Complete user journey test:
  1. Sign up as a new user
  2. Verify default categories exist
  3. Add a custom expense category
  4. Add 3 income transactions with different dates
  5. Add 5 expense transactions across different categories
  6. Add 2 shareholders totaling 100%
  7. View dashboard — verify metrics and charts are correct
  8. Navigate to disbursements — verify profit calculation
  9. Record a disbursement for one shareholder
  10. Verify available profit updates
  11. Export income transactions to CSV
  12. Export expense transactions to CSV
  13. Change password in settings
  14. Log out and log back in with new password
- Document any bugs found and fix them

**Validation:** All 14 steps complete successfully with no errors; exported CSVs are valid; all calculations are accurate.

---

### Task 7.13 — Production build and deployment readiness
**File(s):** `svelte.config.js`, `package.json`, `convex/`

- Run `pnpm build` and verify zero errors
- Run `pnpm convex deploy` dry run (or document deployment steps)
- Verify environment variables are documented (`.env.example`)
- Ensure no development-only code (console.logs, test data) remains
- Create `.env.example` with required variables listed
- Verify the built application works in preview mode (`pnpm preview`)

**Validation:** `pnpm build` exits 0; `pnpm preview` serves the full app correctly; no console errors in production build.
