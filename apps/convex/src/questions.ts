import { doc } from "convex-helpers/validators";
import { v } from "convex/values";

import { query } from "./_generated/server";
import schema from "./schema";

// ========================================================================================
// Many
// ========================================================================================

export const allByGameId = query({
  args: { gameId: v.id("games") },
  returns: v.array(doc(schema, "questions")),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_gameId_and_index", (q) => q.eq("gameId", args.gameId))
      .collect();
  },
});
