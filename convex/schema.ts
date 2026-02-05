import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
	...authTables,
	users: defineTable({
		name: v.optional(v.string()),
		image: v.optional(v.string()),
		email: v.optional(v.string()),
		emailVerificationTime: v.optional(v.number()),
		phone: v.optional(v.string()),
		phoneVerificationTime: v.optional(v.number()),
		isAnonymous: v.optional(v.boolean()),
	}).index("email", ["email"]),

	transactions: defineTable({
		type: v.union(v.literal("income"), v.literal("expense")),
		amount: v.number(),
		category: v.optional(v.string()),
		description: v.string(),
		date: v.number(),
		notes: v.optional(v.string()),
		createdBy: v.id("users"),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_date", ["date"])
		.index("by_type", ["type"])
		.index("by_type_and_date", ["type", "date"])
		.index("by_category", ["category"]),

	expenseCategories: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		isActive: v.boolean(),
		createdAt: v.number(),
	}).index("by_isActive", ["isActive"]),

	shareholders: defineTable({
		name: v.string(),
		email: v.string(),
		sharePercentage: v.number(),
		isActive: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_isActive", ["isActive"]),

	disbursements: defineTable({
		shareholderId: v.id("shareholders"),
		amount: v.number(),
		date: v.number(),
		period: v.string(),
		notes: v.optional(v.string()),
		createdBy: v.id("users"),
		createdAt: v.number(),
	})
		.index("by_shareholderId", ["shareholderId"])
		.index("by_period", ["period"]),
});

export default schema;
