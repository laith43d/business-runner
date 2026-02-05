import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const viewer = query({
	args: {},
	returns: v.union(
		v.object({
			_id: v.id("users"),
			name: v.optional(v.string()),
			email: v.optional(v.string()),
			image: v.optional(v.string()),
		}),
		v.null(),
	),
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return null;
		}
		const user = await ctx.db.get(userId);
		if (!user) {
			return null;
		}
		return {
			_id: user._id,
			name: user.name,
			email: user.email,
			image: user.image,
		};
	},
});
