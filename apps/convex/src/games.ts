import type { GenericDatabaseReader } from "convex/server";
import { SessionIdArg } from "convex-helpers/server/sessions";
import { doc } from "convex-helpers/validators";
import { ConvexError, v } from "convex/values";

import type { DataModel, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { CHARACTER_OPTIONS } from "./fields/character";
import { gameCodeValidator, generateGameCode } from "./fields/gameCode";
import { movieValidator } from "./fields/movie";
import { quizThemeValidator } from "./fields/quizTheme";
import { quizToneValidator } from "./fields/quizTone";
import schema from "./schema";

// ========================================================================================
// Create
// ========================================================================================

export const create = mutation({
  args: { ...SessionIdArg },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Generate a unique game code.
    let code: string;
    let existing;
    do {
      code = generateGameCode();
      existing = await ctx.db
        .query("games")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique();
    } while (existing !== null);

    // Create the game.
    const gameId = await ctx.db.insert("games", {
      code,
      status: "lobby",
      quizMovie: null,
      quizTone: "standard",
      quizTheme: "fun-facts",
      questionCount: 10,
      timeLimitSeconds: 60,
      roundEndsAt: undefined,
      currentQuestionIndex: 0,
    });

    // Random character for the player.
    const character = CHARACTER_OPTIONS[Math.floor(Math.random() * CHARACTER_OPTIONS.length)]; // prettier-ignore
    if (!character) throw new Error("Failed to generate a random character.");

    // Add the player to the game.
    await ctx.db.insert("players", {
      gameId,
      sessionId: args.sessionId,
      character: character.value,
      isReady: false,
    });
    return code;
  },
});

// ========================================================================================
// Single
// ========================================================================================

export const byCode = query({
  args: { code: gameCodeValidator },
  returns: v.nullable(doc(schema, "games")),
  handler: (ctx, args) => {
    return ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
  },
});

// ========================================================================================
// Update
// ========================================================================================

export const updateQuizMovie = mutation({
  args: {
    ...SessionIdArg,
    gameId: v.id("games"),
    quizMovie: movieValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureParticipant(ctx, args.gameId, args.sessionId);
    await ctx.db.patch(args.gameId, { quizMovie: args.quizMovie });
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
