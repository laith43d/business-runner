# Sprint 6: Dashboard & Analytics

## Goal
Build the main dashboard with key metric cards and interactive charts providing visual business insights. This is the landing page for authenticated users.

## Demo Criteria
- Navigate to `/` (Dashboard) and see key metrics at a glance
- Interactive charts showing income vs expenses trend, expense breakdown, monthly income, profit margin, and top expense categories
- Date range filter changes all metrics and charts
- Charts render with Arabic labels and RTL-friendly layout
- Responsive layout on mobile
- All UI in Arabic

---

## Tasks

### Task 6.1 — Install and configure chart library
**File(s):** `package.json`, `src/lib/components/charts/`

- Install Chart.js and a Svelte wrapper (e.g., `svelte-chartjs` or use Chart.js directly with Svelte actions)
- Configure Chart.js defaults for Arabic locale: RTL text direction, Arabic number formatting, Arabic month names
- Create a base chart wrapper component `ChartContainer.svelte` that handles: responsive sizing, loading state, empty data state, consistent styling (fonts, colors, padding)

**Validation:** A test chart renders with Arabic labels and proper RTL alignment.

---

### Task 6.2 — Convex queries: dashboard aggregations
**File(s):** `convex/dashboard.ts`

- Create `getMetrics` query: accepts `dateFrom`, `dateTo`; returns `{ totalIncome, totalExpenses, netProfit, availableProfit, profitMargin }` where `profitMargin = (netProfit / totalIncome) * 100`
- Create `getMonthlyTrend` query: accepts `dateFrom`, `dateTo`; returns array of `{ month: string, income: number, expenses: number, profit: number }` grouped by month
- Create `getExpenseBreakdown` query: accepts `dateFrom`, `dateTo`; returns array of `{ category: string, total: number, percentage: number }` ordered by total descending
- Create `getTopExpenseCategories` query: accepts `dateFrom`, `dateTo`, `limit` (default 5); returns top N categories by total spend
- All require authenticated user

**Validation:** Queries return correctly aggregated data; empty date ranges return zero values, not errors.

---

### Task 6.3 — Dashboard page: metric cards row
**File(s):** `src/routes/(app)/+page.svelte`, `src/lib/components/dashboard/MetricCard.svelte`

- Replace placeholder dashboard with real implementation
- Top: `DateRangeFilter` component (reuse from Sprint 3)
- Row of 4 metric cards: إجمالي الإيرادات (Total Income), إجمالي المصروفات (Total Expenses), صافي الربح (Net Profit), الأرباح المتاحة (Available Profit)
- Each card shows: label, formatted amount, and an icon
- Net Profit card: green text if positive, red if negative
- Profit Margin shown as a subtitle on the Net Profit card (e.g., "هامش الربح: ٤٥٪")
- Loading skeleton state

**Validation:** Cards show correct values; changing date range updates values; negative profit shows red styling.

---

### Task 6.4 — Income vs Expenses line chart
**File(s):** `src/lib/components/dashboard/IncomeExpensesChart.svelte`

- Line chart with two lines: Income (green) and Expenses (red)
- X-axis: months in the date range (Arabic month names)
- Y-axis: amounts (formatted with Arabic numerals)
- Tooltip showing month, income, and expense values
- Data from `dashboard.getMonthlyTrend` query
- Responsive: fills container width

**Validation:** Chart renders with correct monthly data points; hovering shows tooltip with accurate values.

---

### Task 6.5 — Expense breakdown donut chart
**File(s):** `src/lib/components/dashboard/ExpenseBreakdownChart.svelte`

- Donut/pie chart showing expense distribution by category
- Each slice labeled with category name (Arabic) and percentage
- Legend below or to the side showing category name, amount, and percentage
- Data from `dashboard.getExpenseBreakdown` query
- Color palette with distinct, accessible colors

**Validation:** Chart segments match category totals; percentages sum to ~100%; legend is readable.

---

### Task 6.6 — Monthly income bar chart
**File(s):** `src/lib/components/dashboard/MonthlyIncomeChart.svelte`

- Vertical bar chart showing income per month
- X-axis: months (Arabic)
- Y-axis: income amounts
- Bars colored consistently
- Data from `dashboard.getMonthlyTrend` query (income field)

**Validation:** Bars match monthly income values; months display in Arabic.

---

### Task 6.7 — Profit margin percentage line chart
**File(s):** `src/lib/components/dashboard/ProfitMarginChart.svelte`

- Line chart showing profit margin % over time
- X-axis: months
- Y-axis: percentage (0-100%)
- Reference line at 0% for clarity
- Data derived from monthly trend (profit/income * 100 per month)

**Validation:** Profit margin line correctly calculated; months with zero income handled gracefully (show 0% not NaN).

---

### Task 6.8 — Top expense categories horizontal bar chart
**File(s):** `src/lib/components/dashboard/TopCategoriesChart.svelte`

- Horizontal bar chart showing top 5 expense categories by total
- Y-axis: category names (Arabic)
- X-axis: amounts
- Bars colored by category
- Data from `dashboard.getTopExpenseCategories` query

**Validation:** Top 5 categories displayed in descending order; amounts match actual expense totals.

---

### Task 6.9 — Dashboard responsive layout
**File(s):** `src/routes/(app)/+page.svelte`

- Arrange dashboard components in a responsive grid:
  - Desktop: 4 metric cards in a row; charts in a 2x2 grid; top categories full width below
  - Tablet: 2 metric cards per row; charts stacked or 2-column
  - Mobile: single column, all stacked
- Use Tailwind CSS grid/flex utilities
- Ensure charts resize properly on window resize

**Validation:** Dashboard looks good at 1440px, 1024px, 768px, and 375px widths.

---

### Task 6.10 — Dashboard loading and empty states
**File(s):** `src/routes/(app)/+page.svelte`, all chart components

- While data is loading: show skeleton loaders for metric cards and chart placeholder boxes
- When no data exists (new business, no transactions): show a friendly empty state message with a CTA to add first transaction
- Charts show "لا توجد بيانات" (No data) message when data arrays are empty

**Validation:** Fresh account with no transactions shows empty state; page with data shows all components after loading.
