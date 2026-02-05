# Product Requirements Document: Income & Expense Tracker

## Overview
A simple income and expense tracking application for small businesses or partnerships to manage cash flow, categorize expenses, track shareholder ownership, and distribute profits based on ownership percentages.

The application will have simple authentication and user management using username/password.
The project is exclusively in Arabic, NO multi-language support is required.

## Product Goals
- Provide straightforward income and expense tracking without double-entry complexity
- Enable multiple shareholders to track ownership and profit distribution
- Deliver business insights through a visual dashboard
- Maintain real-time data synchronization across users

## Core Features

### 1. Account Management
**Income Account**
- Single unified income account to record all revenue
- Each transaction includes: amount, date, description, and optional notes
- Support for different income sources (tags/labels)

**Expense Account with Sub-accounts**
- Main expense account with multiple category sub-accounts
- Common categories: Rent, Utilities, Salaries, Marketing, Supplies, Operations, Miscellaneous
- Users can create, edit, and delete expense categories
- Each expense transaction includes: amount, date, category, description, receipt attachment (optional)

### 2. Transaction Management
- Add income entries with timestamp, amount, and description
- Add expense entries with category selection
- Edit and delete transactions (with audit trail)
- Filter transactions by date range, category, or amount
- Search transactions by description
- Export transaction history (CSV format)

### 3. Shareholder Management
- Define multiple shareholders with names and ownership percentages
- Ownership percentages must total 100%
- View shareholder list with current ownership stakes
- Edit shareholder information and percentages
- Track historical ownership changes

### 4. Profit Distribution
- Calculate total profit: `Total Income - Total Expenses`
- Display each shareholder's profit share based on percentage
- Record disbursement transactions when shareholders withdraw profits
- Disbursements reduce available profit pool
- History of all disbursements with date, shareholder, and amount
- Period-based profit calculation (month, quarter, year)

### 5. Dashboard & Analytics
**Key Metrics Cards**
- Total Income (current period)
- Total Expenses (current period)
- Net Profit (current period)
- Available Profit for Distribution

**Visualizations**
- Income vs Expenses line chart (monthly trend)
- Expense breakdown by category (pie/donut chart)
- Monthly income trend (bar chart)
- Profit margin percentage over time
- Top expense categories (horizontal bar chart)

**Date Range Filters**
- This Month, Last Month, Last 3 Months, Last 6 Months, This Year, Custom Range

## User Roles & Permissions
**Admin**
- Full access to all features
- Manage shareholders
- Record income and expenses
- Process disbursements


## Data Model

### Transactions Table
```
{
  _id: string
  type: "income" | "expense"
  amount: number
  category: string | null  // null for income, category name for expenses
  description: string
  date: timestamp
  createdBy: userId
  createdAt: timestamp
  updatedAt: timestamp
}
```

### ExpenseCategories Table
```
{
  _id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: timestamp
}
```

### Shareholders Table
```
{
  _id: string
  name: string
  email: string
  sharePercentage: number
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Disbursements Table
```
{
  _id: string
  shareholderId: string
  amount: number
  date: timestamp
  period: string  // e.g., "2026-Q1"
  notes: string | null
  createdBy: userId
  createdAt: timestamp
}
```

## Technical Stack

### Frontend
- **SvelteKit** - Full-stack framework with SSR/SPA capabilities
- **shadcn-svelte** - UI component library for consistent design
- **Tailwind CSS** - Utility-first styling (included with shadcn-svelte)
- **Chart.js** or **Recharts** - Data visualization

### Backend & Database
- **Convex** - Real-time backend with:
  - Serverless functions for business logic
  - Real-time data synchronization
  - Built-in authentication
  - Type-safe API queries and mutations

### Deployment
- **Vercel** - SvelteKit hosting (recommended)
- **Convex Cloud** - Backend infrastructure

## UI Pages & Routes

### `/` - Dashboard
Main analytics view with charts and key metrics

### `/income` - Income Transactions
List view with add/edit functionality

### `/expenses` - Expense Transactions
List view with category filtering

### `/categories` - Expense Categories
Manage expense category sub-accounts

### `/shareholders` - Shareholder Management
View and edit shareholder information

### `/disbursements` - Profit Distribution
Record and view profit disbursements

### `/settings` - Application Settings
User preferences and account settings

## Key User Flows

### Recording an Expense
1. Navigate to Expenses page
2. Click "Add Expense" button
3. Fill form: amount, category (dropdown), description, date
4. Submit → Real-time update to dashboard and expense list

### Processing Profit Distribution
1. Navigate to Disbursements page
2. View current period profit and each shareholder's calculated share
3. Select shareholder and enter disbursement amount
4. Confirm → Creates disbursement record and reduces available profit

### Viewing Business Performance
1. Navigate to Dashboard
2. Select date range filter
3. View updated charts and metrics
4. Export data if needed

## Success Metrics
- Transaction entry time < 30 seconds
- Dashboard load time < 2 seconds
- Zero data sync conflicts
- 100% accurate profit calculations

## Future Enhancements (Out of Scope for V1)
- Multi-currency support
- Recurring transactions
- Budget forecasting
- Invoice generation
- Mobile application
- Bank account integration
- Multi-business support
- Advanced reporting (P&L statements)

## Technical Implementation Notes

### Convex Schema Setup
```typescript
// schema.ts
transactions: defineTable({
  type: v.union(v.literal("income"), v.literal("expense")),
  amount: v.number(),
  category: v.optional(v.string()),
  description: v.string(),
  date: v.number(),
  // ...
})
```

### Key Convex Queries
- `getTransactions(dateRange, type?, category?)`
- `getIncomeTotal(dateRange)`
- `getExpensesByCategory(dateRange)`
- `getProfit(dateRange)`
- `getShareholderShares()`

### Component Structure (shadcn-svelte)
- `TransactionForm` - Reusable for income/expense entry
- `DataTable` - Transaction list with sorting/filtering
- `MetricCard` - Dashboard stat display
- `ShareholderCard` - Individual shareholder info
- `ChartContainer` - Wrapper for chart components

***

**Document Version:** 1.0  
**Last Updated:** February 5, 2026  
**Status:** Draft for Review
