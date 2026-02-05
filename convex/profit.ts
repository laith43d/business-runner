import { query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Calculate profit summary for a given date range.
 * Returns total income, total expenses, net profit, total disbursements, and available profit.
 */
export const getProfitSummary = query({
	args: {
		dateFrom: v.number(),
		dateTo: v.number(),
	},
	returns: v.object({
		totalIncome: v.number(),
		totalExpenses: v.number(),
		netProfit: v.number(),
		totalDisbursements: v.number(),
		availableProfit: v.number(),
	}),
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		// Get income transactions in range
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

		// Get expense transactions in range
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

		return {
			totalIncome: Math.round(totalIncome * 100) / 100,
			totalExpenses: Math.round(totalExpenses * 100) / 100,
			netProfit: Math.round(netProfit * 100) / 100,
			totalDisbursements: Math.round(totalDisbursements * 100) / 100,
			availableProfit: Math.round(availableProfit * 100) / 100,
		};
	},
});

/**
 * Get each active shareholder's profit share for a given date range.
 * Returns shareAmount, disbursed, and remaining for each shareholder.
 */
export const getShareholderShares = query({
	args: {
		dateFrom: v.number(),
		dateTo: v.number(),
	},
	returns: v.array(
		v.object({
			shareholderId: v.id("shareholders"),
			shareholderName: v.string(),
			sharePercentage: v.number(),
			shareAmount: v.number(),
			disbursed: v.number(),
			remaining: v.number(),
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

		// Calculate net profit
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

		// Get active shareholders
		const shareholders = await ctx.db
			.query("shareholders")
			.filter((q) => q.eq(q.field("isActive"), true))
			.collect();

		// Get all disbursements in the period
		const allDisbursements = await ctx.db.query("disbursements").collect();
		const periodDisbursements = allDisbursements.filter(
			(d) => d.date >= args.dateFrom && d.date <= args.dateTo,
		);

		// Build per-shareholder disbursement totals
		const disbursementsByShareholder = new Map<string, number>();
		for (const d of periodDisbursements) {
			const current = disbursementsByShareholder.get(
				d.shareholderId as string,
			) ?? 0;
			disbursementsByShareholder.set(
				d.shareholderId as string,
				current + d.amount,
			);
		}

		// Build result
		const result = shareholders
			.sort((a, b) => a.name.localeCompare(b.name, "ar"))
			.map((s) => {
				const shareAmount =
					Math.round(netProfit * (s.sharePercentage / 100) * 100) /
					100;
				const disbursed =
					disbursementsByShareholder.get(s._id as string) ?? 0;
				const remaining =
					Math.round((shareAmount - disbursed) * 100) / 100;

				return {
					shareholderId: s._id,
					shareholderName: s.name,
					sharePercentage: s.sharePercentage,
					shareAmount,
					disbursed: Math.round(disbursed * 100) / 100,
					remaining,
				};
			});

		return result;
	},
});
