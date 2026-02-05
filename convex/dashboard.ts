import { query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Arabic month names for grouping.
 */
const ARABIC_MONTHS = [
	"يناير",
	"فبراير",
	"مارس",
	"أبريل",
	"مايو",
	"يونيو",
	"يوليو",
	"أغسطس",
	"سبتمبر",
	"أكتوبر",
	"نوفمبر",
	"ديسمبر",
];

/**
 * Helper: get month key from timestamp (e.g. "2025-01")
 */
function getMonthKey(timestamp: number): string {
	const d = new Date(timestamp);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}`;
}

/**
 * Helper: get Arabic label from month key (e.g. "2025-01" → "يناير ٢٠٢٥")
 */
function getArabicMonthLabel(monthKey: string): string {
	const [year, month] = monthKey.split("-");
	const monthIndex = parseInt(month, 10) - 1;
	return `${ARABIC_MONTHS[monthIndex]} ${year}`;
}

/**
 * Get key financial metrics for a date range.
 */
export const getMetrics = query({
	args: {
		dateFrom: v.number(),
		dateTo: v.number(),
	},
	returns: v.object({
		totalIncome: v.number(),
		totalExpenses: v.number(),
		netProfit: v.number(),
		availableProfit: v.number(),
		profitMargin: v.number(),
	}),
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		const incomeTransactions = await ctx.db
			.query("transactions")
			.withIndex("by_type_and_date", (idx) =>
				idx
					.eq("type", "income")
					.gte("date", args.dateFrom)
					.lte("date", args.dateTo),
			)
			.collect();

		const totalIncome = incomeTransactions.reduce(
			(sum, t) => sum + t.amount,
			0,
		);

		const expenseTransactions = await ctx.db
			.query("transactions")
			.withIndex("by_type_and_date", (idx) =>
				idx
					.eq("type", "expense")
					.gte("date", args.dateFrom)
					.lte("date", args.dateTo),
			)
			.collect();

		const totalExpenses = expenseTransactions.reduce(
			(sum, t) => sum + t.amount,
			0,
		);

		const netProfit = totalIncome - totalExpenses;

		// Get disbursements in the period
		const allDisbursements = await ctx.db.query("disbursements").collect();
		const periodDisbursements = allDisbursements.filter(
			(d) => d.date >= args.dateFrom && d.date <= args.dateTo,
		);

		const totalDisbursements = periodDisbursements.reduce(
			(sum, d) => sum + d.amount,
			0,
		);

		const availableProfit = netProfit - totalDisbursements;
		const profitMargin =
			totalIncome > 0
				? Math.round((netProfit / totalIncome) * 100 * 100) / 100
				: 0;

		return {
			totalIncome: Math.round(totalIncome * 100) / 100,
			totalExpenses: Math.round(totalExpenses * 100) / 100,
			netProfit: Math.round(netProfit * 100) / 100,
			availableProfit: Math.round(availableProfit * 100) / 100,
			profitMargin,
		};
	},
});

/**
 * Get monthly trend data (income, expenses, profit per month).
 */
export const getMonthlyTrend = query({
	args: {
		dateFrom: v.number(),
		dateTo: v.number(),
	},
	returns: v.array(
		v.object({
			month: v.string(),
			monthKey: v.string(),
			income: v.number(),
			expenses: v.number(),
			profit: v.number(),
		}),
	),
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		const incomeTransactions = await ctx.db
			.query("transactions")
			.withIndex("by_type_and_date", (idx) =>
				idx
					.eq("type", "income")
					.gte("date", args.dateFrom)
					.lte("date", args.dateTo),
			)
			.collect();

		const expenseTransactions = await ctx.db
			.query("transactions")
			.withIndex("by_type_and_date", (idx) =>
				idx
					.eq("type", "expense")
					.gte("date", args.dateFrom)
					.lte("date", args.dateTo),
			)
			.collect();

		// Group by month — only include months that have transactions
		const monthlyData = new Map<
			string,
			{ income: number; expenses: number }
		>();

		for (const t of incomeTransactions) {
			const key = getMonthKey(t.date);
			const existing = monthlyData.get(key) ?? {
				income: 0,
				expenses: 0,
			};
			existing.income += t.amount;
			monthlyData.set(key, existing);
		}

		for (const t of expenseTransactions) {
			const key = getMonthKey(t.date);
			const existing = monthlyData.get(key) ?? {
				income: 0,
				expenses: 0,
			};
			existing.expenses += t.amount;
			monthlyData.set(key, existing);
		}

		// If we have data, fill in gaps between min and max month
		if (monthlyData.size > 0) {
			const sortedKeys = Array.from(monthlyData.keys()).sort();
			const firstKey = sortedKeys[0];
			const lastKey = sortedKeys[sortedKeys.length - 1];
			const [startYear, startMonth] = firstKey.split("-").map(Number);
			const [endYear, endMonth] = lastKey.split("-").map(Number);

			let current = new Date(startYear, startMonth - 1, 1);
			const end = new Date(endYear, endMonth - 1, 1);

			while (current <= end) {
				const key = getMonthKey(current.getTime());
				if (!monthlyData.has(key)) {
					monthlyData.set(key, { income: 0, expenses: 0 });
				}
				current.setMonth(current.getMonth() + 1);
			}
		}

		// Sort by month key and build result
		const sortedKeys = Array.from(monthlyData.keys()).sort();
		return sortedKeys.map((key) => {
			const data = monthlyData.get(key)!;
			const income = Math.round(data.income * 100) / 100;
			const expenses = Math.round(data.expenses * 100) / 100;
			return {
				month: getArabicMonthLabel(key),
				monthKey: key,
				income,
				expenses,
				profit: Math.round((income - expenses) * 100) / 100,
			};
		});
	},
});

/**
 * Get expense breakdown by category.
 */
export const getExpenseBreakdown = query({
	args: {
		dateFrom: v.number(),
		dateTo: v.number(),
	},
	returns: v.array(
		v.object({
			category: v.string(),
			total: v.number(),
			percentage: v.number(),
		}),
	),
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		const expenseTransactions = await ctx.db
			.query("transactions")
			.withIndex("by_type_and_date", (idx) =>
				idx
					.eq("type", "expense")
					.gte("date", args.dateFrom)
					.lte("date", args.dateTo),
			)
			.collect();

		// Group by category
		const categoryTotals = new Map<string, number>();
		let grandTotal = 0;

		for (const t of expenseTransactions) {
			const cat = t.category ?? "غير مصنف";
			categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + t.amount);
			grandTotal += t.amount;
		}

		// Build array sorted by total descending
		const result = Array.from(categoryTotals.entries())
			.map(([category, total]) => ({
				category,
				total: Math.round(total * 100) / 100,
				percentage:
					grandTotal > 0
						? Math.round((total / grandTotal) * 100 * 10) / 10
						: 0,
			}))
			.sort((a, b) => b.total - a.total);

		return result;
	},
});

/**
 * Get top N expense categories by total spend.
 */
export const getTopExpenseCategories = query({
	args: {
		dateFrom: v.number(),
		dateTo: v.number(),
		limit: v.optional(v.number()),
	},
	returns: v.array(
		v.object({
			category: v.string(),
			total: v.number(),
			percentage: v.number(),
		}),
	),
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		const limit = args.limit ?? 5;

		const expenseTransactions = await ctx.db
			.query("transactions")
			.withIndex("by_type_and_date", (idx) =>
				idx
					.eq("type", "expense")
					.gte("date", args.dateFrom)
					.lte("date", args.dateTo),
			)
			.collect();

		// Group by category
		const categoryTotals = new Map<string, number>();
		let grandTotal = 0;

		for (const t of expenseTransactions) {
			const cat = t.category ?? "غير مصنف";
			categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + t.amount);
			grandTotal += t.amount;
		}

		// Sort descending and take top N
		const sorted = Array.from(categoryTotals.entries())
			.map(([category, total]) => ({
				category,
				total: Math.round(total * 100) / 100,
				percentage:
					grandTotal > 0
						? Math.round((total / grandTotal) * 100 * 10) / 10
						: 0,
			}))
			.sort((a, b) => b.total - a.total)
			.slice(0, limit);

		return sorted;
	},
});
