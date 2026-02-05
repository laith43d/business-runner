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

/**
 * Seed demo transactions for dashboard testing.
 * Creates income and expense transactions across the last 6 months.
 */
export const seedDemoTransactions = mutation({
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

		// Check if we already have transactions
		const existing = await ctx.db.query("transactions").take(1);
		if (existing.length > 0) {
			return 0; // already seeded
		}

		const now = new Date();
		const categories = ["إيجار", "مرافق", "رواتب", "تسويق", "مستلزمات", "تشغيل", "متفرقات"];
		const incomeDescriptions = [
			"مبيعات منتجات",
			"خدمات استشارية",
			"اشتراكات شهرية",
			"عقد صيانة",
			"مبيعات إلكترونية",
		];

		const transactions: Array<{
			type: "income" | "expense";
			amount: number;
			description: string;
			date: number;
			category?: string;
			notes?: string;
			createdBy: typeof userId;
			createdAt: number;
			updatedAt: number;
		}> = [];

		// Generate 6 months of data
		for (let m = 5; m >= 0; m--) {
			const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);

			// 3-5 income transactions per month
			const incomeCount = 3 + Math.floor(Math.random() * 3);
			for (let i = 0; i < incomeCount; i++) {
				const day = 1 + Math.floor(Math.random() * 27);
				const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
				transactions.push({
					type: "income",
					amount: Math.round((2000 + Math.random() * 8000) * 100) / 100,
					description: incomeDescriptions[Math.floor(Math.random() * incomeDescriptions.length)],
					date: date.getTime(),
					createdBy: userId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			}

			// 4-8 expense transactions per month
			const expenseCount = 4 + Math.floor(Math.random() * 5);
			for (let i = 0; i < expenseCount; i++) {
				const day = 1 + Math.floor(Math.random() * 27);
				const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
				const cat = categories[Math.floor(Math.random() * categories.length)];
				transactions.push({
					type: "expense",
					amount: Math.round((500 + Math.random() * 4000) * 100) / 100,
					description: `مصروف - ${cat}`,
					date: date.getTime(),
					category: cat,
					createdBy: userId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			}
		}

		// Insert all transactions
		for (const t of transactions) {
			await ctx.db.insert("transactions", t);
		}

		return transactions.length;
	},
});
