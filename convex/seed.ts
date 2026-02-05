import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const DEFAULT_CATEGORIES = [
	{ name: "إيجار", description: "مصاريف الإيجار والعقارات" },
	{ name: "مرافق", description: "الكهرباء والماء والإنترنت" },
	{ name: "رواتب", description: "رواتب الموظفين والأجور" },
	{ name: "تسويق", description: "مصاريف التسويق والإعلان" },
	{ name: "مستلزمات", description: "المستلزمات والمواد الاستهلاكية" },
	{ name: "تشغيل", description: "مصاريف التشغيل العامة" },
	{ name: "متفرقات", description: "مصاريف متنوعة أخرى" },
];

export const seedDefaultCategories = internalMutation({
	args: {},
	returns: v.null(),
	handler: async (ctx) => {
		const existing = await ctx.db.query("expenseCategories").collect();

		if (existing.length > 0) {
			console.log(
				`Expense categories table already has ${existing.length} rows. Skipping seed.`,
			);
			return null;
		}

		for (const category of DEFAULT_CATEGORIES) {
			await ctx.db.insert("expenseCategories", {
				name: category.name,
				description: category.description,
				isActive: true,
				createdAt: Date.now(),
			});
		}

		console.log(
			`Seeded ${DEFAULT_CATEGORIES.length} default expense categories.`,
		);
		return null;
	},
});

/**
 * Seed default expense categories (callable from client).
 * Skips categories whose names already exist.
 */
export const seedExpenseCategories = mutation({
	args: {},
	returns: v.number(),
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new ConvexError({
				code: "UNAUTHENTICATED",
				message: "يجب تسجيل الدخول",
			});
		}

		const existing = await ctx.db.query("expenseCategories").collect();
		const existingNames = new Set(
			existing.map((c) => c.name.toLowerCase()),
		);

		let inserted = 0;
		for (const category of DEFAULT_CATEGORIES) {
			if (!existingNames.has(category.name.toLowerCase())) {
				await ctx.db.insert("expenseCategories", {
					name: category.name,
					description: category.description,
					isActive: true,
					createdAt: Date.now(),
				});
				inserted++;
			}
		}

		return inserted;
	},
});
