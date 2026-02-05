import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all active shareholders, ordered by name.
 */
export const list = query({
	args: {},
	returns: v.array(
		v.object({
			_id: v.id("shareholders"),
			_creationTime: v.number(),
			name: v.string(),
			email: v.string(),
			sharePercentage: v.number(),
			isActive: v.boolean(),
			createdAt: v.number(),
			updatedAt: v.number(),
		}),
	),
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		const shareholders = await ctx.db
			.query("shareholders")
			.withIndex("by_isActive", (q) => q.eq("isActive", true))
			.collect();

		return shareholders.sort((a, b) => a.name.localeCompare(b.name, "ar"));
	},
});

/**
 * List all shareholders including inactive.
 */
export const listAll = query({
	args: {},
	returns: v.array(
		v.object({
			_id: v.id("shareholders"),
			_creationTime: v.number(),
			name: v.string(),
			email: v.string(),
			sharePercentage: v.number(),
			isActive: v.boolean(),
			createdAt: v.number(),
			updatedAt: v.number(),
		}),
	),
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		const shareholders = await ctx.db.query("shareholders").collect();
		return shareholders.sort((a, b) => a.name.localeCompare(b.name, "ar"));
	},
});

/**
 * Get a single shareholder by ID.
 */
export const getById = query({
	args: {
		id: v.id("shareholders"),
	},
	returns: v.union(
		v.object({
			_id: v.id("shareholders"),
			_creationTime: v.number(),
			name: v.string(),
			email: v.string(),
			sharePercentage: v.number(),
			isActive: v.boolean(),
			createdAt: v.number(),
			updatedAt: v.number(),
		}),
		v.null(),
	),
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		return await ctx.db.get(args.id);
	},
});

/**
 * Get total share percentage for all active shareholders.
 * Returns { total, remaining } where remaining = 100 - total.
 */
export const getTotalPercentage = query({
	args: {},
	returns: v.object({
		total: v.number(),
		remaining: v.number(),
	}),
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		const activeShareholders = await ctx.db
			.query("shareholders")
			.withIndex("by_isActive", (q) => q.eq("isActive", true))
			.collect();

		const total = activeShareholders.reduce(
			(sum, s) => sum + s.sharePercentage,
			0,
		);

		return {
			total: Math.round(total * 100) / 100,
			remaining: Math.round((100 - total) * 100) / 100,
		};
	},
});

/**
 * Create a new shareholder.
 */
export const create = mutation({
	args: {
		name: v.string(),
		email: v.string(),
		sharePercentage: v.number(),
	},
	returns: v.id("shareholders"),
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		// Validate name
		const trimmedName = args.name.trim();
		if (!trimmedName) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: "اسم الشريك مطلوب",
			});
		}

		// Validate email
		const trimmedEmail = args.email.trim();
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: "البريد الإلكتروني غير صالح",
			});
		}

		// Validate percentage range
		if (args.sharePercentage <= 0 || args.sharePercentage > 100) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: "نسبة الملكية يجب أن تكون بين 0 و 100",
			});
		}

		// Check total doesn't exceed 100%
		const activeShareholders = await ctx.db
			.query("shareholders")
			.withIndex("by_isActive", (q) => q.eq("isActive", true))
			.collect();

		const currentTotal = activeShareholders.reduce(
			(sum, s) => sum + s.sharePercentage,
			0,
		);

		if (currentTotal + args.sharePercentage > 100) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: `لا يمكن إضافة هذه النسبة. الإجمالي الحالي ${currentTotal}% والمتبقي ${Math.round((100 - currentTotal) * 100) / 100}%`,
			});
		}

		const now = Date.now();
		return await ctx.db.insert("shareholders", {
			name: trimmedName,
			email: trimmedEmail,
			sharePercentage: args.sharePercentage,
			isActive: true,
			createdAt: now,
			updatedAt: now,
		});
	},
});

/**
 * Update an existing shareholder.
 */
export const update = mutation({
	args: {
		id: v.id("shareholders"),
		name: v.optional(v.string()),
		email: v.optional(v.string()),
		sharePercentage: v.optional(v.number()),
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

		const shareholder = await ctx.db.get(args.id);
		if (!shareholder) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "الشريك غير موجود",
			});
		}

		const updates: Record<string, unknown> = {
			updatedAt: Date.now(),
		};

		if (args.name !== undefined) {
			const trimmedName = args.name.trim();
			if (!trimmedName) {
				throw new ConvexError({
					code: "VALIDATION_ERROR",
					message: "اسم الشريك مطلوب",
				});
			}
			updates.name = trimmedName;
		}

		if (args.email !== undefined) {
			const trimmedEmail = args.email.trim();
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
				throw new ConvexError({
					code: "VALIDATION_ERROR",
					message: "البريد الإلكتروني غير صالح",
				});
			}
			updates.email = trimmedEmail;
		}

		if (args.sharePercentage !== undefined) {
			if (args.sharePercentage <= 0 || args.sharePercentage > 100) {
				throw new ConvexError({
					code: "VALIDATION_ERROR",
					message: "نسبة الملكية يجب أن تكون بين 0 و 100",
				});
			}

			// Check total excluding this shareholder's old percentage
			const activeShareholders = await ctx.db
				.query("shareholders")
				.withIndex("by_isActive", (q) => q.eq("isActive", true))
				.collect();

			const totalExcludingSelf = activeShareholders
				.filter((s) => s._id !== args.id)
				.reduce((sum, s) => sum + s.sharePercentage, 0);

			if (totalExcludingSelf + args.sharePercentage > 100) {
				const remaining =
					Math.round((100 - totalExcludingSelf) * 100) / 100;
				throw new ConvexError({
					code: "VALIDATION_ERROR",
					message: `لا يمكن تعديل النسبة. المتبقي المتاح ${remaining}%`,
				});
			}

			updates.sharePercentage = args.sharePercentage;
		}

		await ctx.db.patch(args.id, updates);
		return null;
	},
});

/**
 * Deactivate (soft delete) a shareholder.
 */
export const deactivate = mutation({
	args: {
		id: v.id("shareholders"),
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

		const shareholder = await ctx.db.get(args.id);
		if (!shareholder) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "الشريك غير موجود",
			});
		}

		await ctx.db.patch(args.id, {
			isActive: false,
			updatedAt: Date.now(),
		});
		return null;
	},
});
