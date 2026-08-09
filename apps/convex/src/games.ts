import type { GenericDatabaseReader } from "convex/server";
import { SessionIdArg } from "convex-helpers/server/sessions";
import { doc } from "convex-helpers/validators";
import { ConvexError, v } from "convex/values";

import type { DataModel, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { gameCodeValidator, gameCodeZodSchema } from "./fields/gameCode";
import {
  questionCountValidator,
  timeLimitSecondsValidator,
} from "./fields/gameSettings";
import { quizAnimalValidator } from "./fields/quizAnimal";
import { quizThemeValidator } from "./fields/quizTheme";
import { quizToneValidator } from "./fields/quizTone";
import { addPlayerToLobby, createGameWithPlayer } from "./gameHelpers";
import schema from "./schema";

// ========================================================================================
// Create
// ========================================================================================

export const create = mutation({
  args: { ...SessionIdArg },
  returns: v.string(),
  handler: async (ctx, args) => {
    const { code } = await createGameWithPlayer(ctx, args.sessionId);
    return code;
  },
});

export const playAgain = mutation({
  args: { gameId: v.id("games"), ...SessionIdArg },
  returns: v.string(),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new ConvexError("Game not found.");
    if (game.status !== "finished") {
      throw new ConvexError("Game is not finished.");
    }

    const player = await ctx.db
      .query("players")
      .withIndex("by_gameId_and_sessionId", (q) =>
        q.eq("gameId", args.gameId).eq("sessionId", args.sessionId),
      )
      .unique();
    if (!player) throw new ConvexError("Not a participant.");

    if (player.replayRequested) {
      if (!game.replayGameId) throw new Error("Replay game not found.");
      const replayGame = await ctx.db.get(game.replayGameId);
      if (!replayGame) throw new Error("Replay game not found.");
      return replayGame.code;
    }

    let replayGameId = game.replayGameId;
    let replayCode: string;
    if (replayGameId) {
      const replayGame = await ctx.db.get(replayGameId);
      if (!replayGame) throw new Error("Replay game not found.");
      await addPlayerToLobby(ctx, replayGameId, args.sessionId);
      replayCode = replayGame.code;
    } else {
      const replayGame = await createGameWithPlayer(ctx, args.sessionId);
      replayGameId = replayGame.gameId;
      replayCode = replayGame.code;
      await ctx.db.patch(game._id, { replayGameId });
    }

    await ctx.db.patch(player._id, { replayRequested: true });
    return replayCode;
  },
});

// ========================================================================================
// Single
// ========================================================================================

export const byCode = query({
  args: { code: gameCodeValidator },
  returns: v.nullable(doc(schema, "games")),
  handler: (ctx, args) => {
    const result = gameCodeZodSchema.safeParse(args.code);
    if (!result.success) return null;

    return ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", result.data))
      .unique();
  },
});

// ========================================================================================
// Update
// ========================================================================================

export const updateQuestionCount = mutation({
  args: {
    ...SessionIdArg,
    gameId: v.id("games"),
    questionCount: questionCountValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureParticipant(ctx, args.gameId, args.sessionId);
    await ctx.db.patch(args.gameId, { questionCount: args.questionCount });
  },
});

export const updateQuizAnimal = mutation({
  args: {
    ...SessionIdArg,
    gameId: v.id("games"),
    quizAnimal: quizAnimalValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureParticipant(ctx, args.gameId, args.sessionId);
    await ctx.db.patch(args.gameId, { quizAnimal: args.quizAnimal });
  },
});

export const updateQuizTone = mutation({
  args: { ...SessionIdArg, gameId: v.id("games"), quizTone: quizToneValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureParticipant(ctx, args.gameId, args.sessionId);
    await ctx.db.patch(args.gameId, { quizTone: args.quizTone });
  },
});

export const updateQuizTheme = mutation({
  args: {
    ...SessionIdArg,
    gameId: v.id("games"),
    quizTheme: quizThemeValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureParticipant(ctx, args.gameId, args.sessionId);
    await ctx.db.patch(args.gameId, { quizTheme: args.quizTheme });
  },
});

export const updateTimeLimitSeconds = mutation({
  args: {
    ...SessionIdArg,
    gameId: v.id("games"),
    timeLimitSeconds: timeLimitSecondsValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureParticipant(ctx, args.gameId, args.sessionId);
    await ctx.db.patch(args.gameId, {
      timeLimitSeconds: args.timeLimitSeconds,
    });
  },
});

// ========================================================================================
// Helpers
// ========================================================================================

// Ensure the player is a participant in the game.
async function ensureParticipant(
  ctx: { db: GenericDatabaseReader<DataModel> },
  gameId: Id<"games">,
  sessionId: string,
) {
  const player = await ctx.db
    .query("players")
    .withIndex("by_gameId_and_sessionId", (q) =>
      q.eq("gameId", gameId).eq("sessionId", sessionId),
    )
    .unique();
  if (!player) throw new ConvexError("Not a participant.");
  return player;
}
