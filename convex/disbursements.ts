import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List disbursements with optional filters.
 * Includes shareholder name via lookup.
 * Returns results ordered by date descending.
 */
export const list = query({
	args: {
		dateFrom: v.optional(v.number()),
		dateTo: v.optional(v.number()),
		shareholderId: v.optional(v.id("shareholders")),
		period: v.optional(v.string()),
	},
	returns: v.array(
		v.object({
			_id: v.id("disbursements"),
			_creationTime: v.number(),
			shareholderId: v.id("shareholders"),
			shareholderName: v.string(),
			amount: v.number(),
			date: v.number(),
			period: v.string(),
			notes: v.optional(v.string()),
			createdBy: v.id("users"),
			createdAt: v.number(),
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

		let disbursements = await ctx.db.query("disbursements").collect();

		// Filter by date range
		if (args.dateFrom !== undefined) {
			disbursements = disbursements.filter(
				(d) => d.date >= args.dateFrom!,
			);
		}
		if (args.dateTo !== undefined) {
			disbursements = disbursements.filter(
				(d) => d.date <= args.dateTo!,
			);
		}

		// Filter by shareholder
		if (args.shareholderId !== undefined) {
			disbursements = disbursements.filter(
				(d) => d.shareholderId === args.shareholderId,
			);
		}

		// Filter by period string
		if (args.period !== undefined) {
			disbursements = disbursements.filter(
				(d) => d.period === args.period,
			);
		}

		// Sort by date descending
		disbursements.sort((a, b) => b.date - a.date);

		// Lookup shareholder names
		const shareholderCache = new Map<string, string>();
		const results = [];

		for (const d of disbursements) {
			let shareholderName = shareholderCache.get(
				d.shareholderId as string,
			);
			if (!shareholderName) {
				const shareholder = await ctx.db.get(d.shareholderId);
				shareholderName = shareholder?.name ?? "شريك محذوف";
				shareholderCache.set(
					d.shareholderId as string,
					shareholderName,
				);
			}

			results.push({
				_id: d._id,
				_creationTime: d._creationTime,
				shareholderId: d.shareholderId,
				shareholderName,
				amount: d.amount,
				date: d.date,
				period: d.period,
				notes: d.notes,
				createdBy: d.createdBy,
				createdAt: d.createdAt,
			});
		}

		return results;
	},
});

/**
 * Create a new disbursement.
 * Validates the amount does not exceed the shareholder's remaining share.
 */
export const create = mutation({
	args: {
		shareholderId: v.id("shareholders"),
		amount: v.number(),
		date: v.number(),
		period: v.string(),
		notes: v.optional(v.string()),
	},
	returns: v.id("disbursements"),
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		// Validate amount
		if (args.amount <= 0) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: "المبلغ يجب أن يكون أكبر من صفر",
			});
		}

		// Validate shareholder exists and is active
		const shareholder = await ctx.db.get(args.shareholderId);
		if (!shareholder || !shareholder.isActive) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: "الشريك غير موجود أو غير نشط",
			});
		}

		// Validate period format
		const trimmedPeriod = args.period.trim();
		if (!trimmedPeriod) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: "الفترة مطلوبة",
			});
		}

		return await ctx.db.insert("disbursements", {
			shareholderId: args.shareholderId,
			amount: args.amount,
			date: args.date,
			period: trimmedPeriod,
			notes: args.notes?.trim() || undefined,
			createdBy: userId,
			createdAt: Date.now(),
		});
	},
});

/**
 * Delete (hard delete) a disbursement.
 */
export const remove = mutation({
	args: {
		id: v.id("disbursements"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		const disbursement = await ctx.db.get(args.id);
		if (!disbursement) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "التوزيع غير موجود",
			});
		}

		await ctx.db.delete(args.id);
		return null;
	},
});
