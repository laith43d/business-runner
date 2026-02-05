import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List transactions with filtering.
 * Filters by type, optional date range, category, and search text.
 * Results ordered by date descending (most recent first).
 * Returns up to 100 results.
 */
export const list = query({
	args: {
		type: v.union(v.literal("income"), v.literal("expense")),
		dateFrom: v.optional(v.number()),
		dateTo: v.optional(v.number()),
		category: v.optional(v.string()),
		searchText: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		let q = ctx.db
			.query("transactions")
			.withIndex("by_type_and_date", (idx) => {
				const byType = idx.eq("type", args.type);
				if (args.dateFrom !== undefined && args.dateTo !== undefined) {
					return byType.gte("date", args.dateFrom).lte("date", args.dateTo);
				} else if (args.dateFrom !== undefined) {
					return byType.gte("date", args.dateFrom);
				} else if (args.dateTo !== undefined) {
					return byType.lte("date", args.dateTo);
				}
				return byType;
			})
			.order("desc");

		// Apply category filter
		if (args.category) {
			const cat = args.category;
			q = q.filter((f) => f.eq(f.field("category"), cat));
		}

		const results = await q.take(100);

		// Post-filter for search text (case-insensitive substring match)
		if (args.searchText) {
			const search = args.searchText.toLowerCase();
			return results.filter((t) =>
				t.description.toLowerCase().includes(search),
			);
		}

		return results;
	},
});

/**
 * Create a new transaction.
 */
export const create = mutation({
	args: {
		type: v.union(v.literal("income"), v.literal("expense")),
		amount: v.number(),
		description: v.string(),
		date: v.number(),
		category: v.optional(v.string()),
		notes: v.optional(v.string()),
	},
	returns: v.id("transactions"),
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		// Validation
		if (args.amount <= 0) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: "المبلغ يجب أن يكون أكبر من صفر",
			});
		}

		const trimmedDesc = args.description.trim();
		if (!trimmedDesc) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: "الوصف مطلوب",
			});
		}

		if (args.type === "expense") {
			if (!args.category) {
				throw new ConvexError({
					code: "VALIDATION_ERROR",
					message: "يجب اختيار تصنيف للمصروف",
				});
			}

			// Verify category exists and is active
			const categories = await ctx.db
				.query("expenseCategories")
				.withIndex("by_isActive", (q) => q.eq("isActive", true))
				.collect();

			const validCategory = categories.find(
				(c) => c.name === args.category,
			);

			if (!validCategory) {
				throw new ConvexError({
					code: "VALIDATION_ERROR",
					message: "التصنيف المحدد غير موجود أو غير نشط",
				});
			}
		}

		if (args.type === "income" && args.category) {
			throw new ConvexError({
				code: "VALIDATION_ERROR",
				message: "الإيرادات لا تحتاج تصنيف",
			});
		}

		const now = Date.now();
		return await ctx.db.insert("transactions", {
			type: args.type,
			amount: args.amount,
			description: trimmedDesc,
			date: args.date,
			category: args.type === "expense" ? args.category : undefined,
			notes: args.notes?.trim() || undefined,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});
	},
});

/**
 * Update an existing transaction.
 */
export const update = mutation({
	args: {
		id: v.id("transactions"),
		amount: v.optional(v.number()),
		description: v.optional(v.string()),
		date: v.optional(v.number()),
		category: v.optional(v.string()),
		notes: v.optional(v.string()),
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

		const transaction = await ctx.db.get(args.id);
		if (!transaction) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "المعاملة غير موجودة",
			});
		}

		const updates: Record<string, unknown> = {};

		if (args.amount !== undefined) {
			if (args.amount <= 0) {
				throw new ConvexError({
					code: "VALIDATION_ERROR",
					message: "المبلغ يجب أن يكون أكبر من صفر",
				});
			}
			updates.amount = args.amount;
		}

		if (args.description !== undefined) {
			const trimmed = args.description.trim();
			if (!trimmed) {
				throw new ConvexError({
					code: "VALIDATION_ERROR",
					message: "الوصف مطلوب",
				});
			}
			updates.description = trimmed;
		}

		if (args.date !== undefined) {
			updates.date = args.date;
		}

		if (args.category !== undefined) {
			if (transaction.type === "expense") {
				if (!args.category) {
					throw new ConvexError({
						code: "VALIDATION_ERROR",
						message: "يجب اختيار تصنيف للمصروف",
					});
				}

				const categories = await ctx.db
					.query("expenseCategories")
					.withIndex("by_isActive", (q) => q.eq("isActive", true))
					.collect();

				const validCategory = categories.find(
					(c) => c.name === args.category,
				);

				if (!validCategory) {
					throw new ConvexError({
						code: "VALIDATION_ERROR",
						message: "التصنيف المحدد غير موجود أو غير نشط",
					});
				}
			}
			updates.category = args.category;
		}

		if (args.notes !== undefined) {
			updates.notes = args.notes.trim() || undefined;
		}

		if (Object.keys(updates).length > 0) {
			updates.updatedAt = Date.now();
			await ctx.db.patch(args.id, updates);
		}

		return null;
	},
});

/**
 * List all transactions for CSV export (no pagination limit).
 * Returns formatted fields ready for export with Arabic column names.
 */
export const listForExport = query({
	args: {
		type: v.union(v.literal("income"), v.literal("expense")),
		dateFrom: v.optional(v.number()),
		dateTo: v.optional(v.number()),
		category: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		let q = ctx.db
			.query("transactions")
			.withIndex("by_type_and_date", (idx) => {
				const byType = idx.eq("type", args.type);
				if (args.dateFrom !== undefined && args.dateTo !== undefined) {
					return byType.gte("date", args.dateFrom).lte("date", args.dateTo);
				} else if (args.dateFrom !== undefined) {
					return byType.gte("date", args.dateFrom);
				} else if (args.dateTo !== undefined) {
					return byType.lte("date", args.dateTo);
				}
				return byType;
			})
			.order("desc");

		// Apply category filter
		if (args.category) {
			const cat = args.category;
			q = q.filter((f) => f.eq(f.field("category"), cat));
		}

		const results = await q.collect();

		// Format for export with Arabic headers
		const typeLabel = args.type === "income" ? "إيراد" : "مصروف";

		return results.map((t) => {
			const date = new Date(t.date);
			const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

			return {
				التاريخ: dateStr,
				النوع: typeLabel,
				المبلغ: t.amount,
				التصنيف: t.category ?? "—",
				الوصف: t.description,
				ملاحظات: t.notes ?? "",
			};
		});
	},
});

/**
 * Delete (hard delete) a transaction.
 */
export const remove = mutation({
	args: {
		id: v.id("transactions"),
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

		const transaction = await ctx.db.get(args.id);
		if (!transaction) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "المعاملة غير موجودة",
			});
		}

		await ctx.db.delete(args.id);
		return null;
	},
});
