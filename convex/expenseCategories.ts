import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all active expense categories, ordered by name.
 */
export const list = query({
	args: {},
	returns: v.array(
		v.object({
			_id: v.id("expenseCategories"),
			_creationTime: v.number(),
			name: v.string(),
			description: v.optional(v.string()),
			isActive: v.boolean(),
			createdAt: v.number(),
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

		const categories = await ctx.db
			.query("expenseCategories")
			.filter((q) => q.eq(q.field("isActive"), true))
			.collect();

		// Sort by name (Arabic alphabetical)
		return categories.sort((a, b) => a.name.localeCompare(b.name, "ar"));
	},
});

/**
 * List all expense categories (including inactive) for admin/settings.
 */
export const listAll = query({
	args: {},
	returns: v.array(
		v.object({
			_id: v.id("expenseCategories"),
			_creationTime: v.number(),
			name: v.string(),
			description: v.optional(v.string()),
			isActive: v.boolean(),
			createdAt: v.number(),
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

		const categories = await ctx.db.query("expenseCategories").collect();

		return categories.sort((a, b) => a.name.localeCompare(b.name, "ar"));
	},
});

/**
 * Create a new expense category.
 */
export const create = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
	},
	returns: v.id("expenseCategories"),
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		const trimmedName = args.name.trim();
		if (!trimmedName) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: "اسم الفئة مطلوب",
			});
		}

		// Check uniqueness among active categories (case-insensitive)
		const existing = await ctx.db
			.query("expenseCategories")
			.filter((q) => q.eq(q.field("isActive"), true))
			.collect();

		const duplicate = existing.find(
			(cat) => cat.name.toLowerCase() === trimmedName.toLowerCase(),
		);

		if (duplicate) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: "يوجد تصنيف بهذا الاسم بالفعل",
			});
		}

		return await ctx.db.insert("expenseCategories", {
			name: trimmedName,
			description: args.description?.trim() || undefined,
			isActive: true,
			createdAt: Date.now(),
		});
	},
});

/**
 * Update an existing expense category.
 */
export const update = mutation({
	args: {
		id: v.id("expenseCategories"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
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

		const category = await ctx.db.get(args.id);
		if (!category) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "التصنيف غير موجود",
			});
		}

		const updates: Record<string, unknown> = {};

		if (args.name !== undefined) {
			const trimmedName = args.name.trim();
			if (!trimmedName) {
				throw new ConvexError({
					code: "VALIDATION_ERROR",
					message: "اسم الفئة مطلوب",
				});
			}

			// Check uniqueness among other active categories
			const existing = await ctx.db
				.query("expenseCategories")
				.filter((q) => q.eq(q.field("isActive"), true))
				.collect();

			const duplicate = existing.find(
				(cat) =>
					cat._id !== args.id &&
					cat.name.toLowerCase() === trimmedName.toLowerCase(),
			);

			if (duplicate) {
				throw new ConvexError({
					code: "VALIDATION_ERROR",
					message: "يوجد تصنيف بهذا الاسم بالفعل",
				});
			}

			updates.name = trimmedName;
		}

		if (args.description !== undefined) {
			updates.description = args.description.trim() || undefined;
		}

		if (Object.keys(updates).length > 0) {
			await ctx.db.patch(args.id, updates);
		}

		return null;
	},
});

/**
 * Deactivate (soft delete) an expense category.
 */
export const deactivate = mutation({
	args: {
		id: v.id("expenseCategories"),
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

		const category = await ctx.db.get(args.id);
		if (!category) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "التصنيف غير موجود",
			});
		}

		await ctx.db.patch(args.id, { isActive: false });
		return null;
	},
});
