import { SessionIdArg } from "convex-helpers/server/sessions";
import { doc } from "convex-helpers/validators";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { characterValidator } from "./fields/character";
import { requireParticipant } from "./playerHelpers";
import schema from "./schema";

// ========================================================================================
// Many
// ========================================================================================

export const allByGameId = query({
  args: { gameId: v.id("games") },
  returns: v.array(
    doc(schema, "answers").extend({
      character: characterValidator,
    }),
  ),
  handler: async (ctx, args) => {
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_gameId_and_questionId", (q) => q.eq("gameId", args.gameId))
      .collect();
    const players = await ctx.db
      .query("players")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
    const playerMap = new Map(players.map((p) => [p._id.toString(), p]));
    return answers.flatMap((a) => {
      const player = playerMap.get(a.playerId.toString());
      if (!player) return [];
      return [{ ...a, character: player.character }];
    });
  },
});

// ========================================================================================
// Update
// ========================================================================================

export const submit = mutation({
  args: {
    ...SessionIdArg,
    gameId: v.id("games"),
    selectedLabel: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new ConvexError("Game not found.");
    if (game.status !== "active" || game.phase !== "answering") return null;

    // Find the player.
    const player = await requireParticipant(ctx, args.gameId, args.sessionId);

    // Find the current question.
    const question = await ctx.db
      .query("questions")
      .withIndex("by_gameId_and_index", (q) =>
        q.eq("gameId", args.gameId).eq("index", game.currentQuestionIndex),
      )
      .unique();
    if (!question) throw new ConvexError("Question not found.");

    // Validate label.
    const validLabels = question.choices.map((c) => c.label);
    if (!validLabels.includes(args.selectedLabel)) throw new ConvexError("Invalid choice label."); // prettier-ignore
    const isCorrect = args.selectedLabel === question.correctLabel;

    // Upsert: check if the player already has an answer for this question.
    const existing = await ctx.db
      .query("answers")
      .withIndex("by_questionId_and_playerId", (q) =>
        q.eq("questionId", question._id).eq("playerId", player._id),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        selectedLabel: args.selectedLabel,
        isCorrect,
        answeredAt: Date.now(),
      });
    } else {
      await ctx.db.insert("answers", {
        gameId: args.gameId,
        questionId: question._id,
        playerId: player._id,
        selectedLabel: args.selectedLabel,
        isCorrect,
        answeredAt: Date.now(),
      });
    }

    // End the question early if all players have now answered.
    const [answerCount, players] = await Promise.all([
      ctx.db
        .query("answers")
        .withIndex("by_gameId_and_questionId", (q) =>
          q.eq("gameId", args.gameId).eq("questionId", question._id),
        )
        .collect()
        .then((rows) => rows.length),
      ctx.db
        .query("players")
        .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
        .collect(),
    ]);
    if (answerCount >= players.length) {
      await ctx.scheduler.runAfter(0, internal.gameEngine.endAnswering, {
        gameId: args.gameId,
        expectedIndex: game.currentQuestionIndex,
      });
    }
  },
});
