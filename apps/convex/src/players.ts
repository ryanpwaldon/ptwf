import { SessionIdArg } from "convex-helpers/server/sessions";
import { doc } from "convex-helpers/validators";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { characterValidator } from "./fields/character";
import { gameCodeValidator, parseGameCode } from "./fields/gameCode";
import { addPlayerToLobby } from "./gameHelpers";
import schema from "./schema";

// ========================================================================================
// Create
// ========================================================================================

export const join = mutation({
  args: {
    code: gameCodeValidator,
    ...SessionIdArg,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const validatedGameCode = parseGameCode(args.code);

    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", validatedGameCode))
      .unique();
    if (!game) throw new ConvexError("Game not found.");
    await addPlayerToLobby(ctx, game._id, args.sessionId);
  },
});

// ========================================================================================
// Single
// ========================================================================================

export const me = query({
  args: { gameId: v.id("games"), ...SessionIdArg },
  returns: v.nullable(
    v.object({
      _id: v.id("players"),
      character: characterValidator,
      isReady: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_gameId_and_sessionId", (q) =>
        q.eq("gameId", args.gameId).eq("sessionId", args.sessionId),
      )
      .unique();
    if (!player) return null;
    return {
      _id: player._id,
      character: player.character,
      isReady: player.isReady,
    };
  },
});

// ========================================================================================
// Many
// ========================================================================================

export const allByGameId = query({
  args: { gameId: v.id("games") },
  returns: v.array(doc(schema, "players").omit("sessionId")),
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
    return players.map((player) => {
      const { sessionId: _sessionId, ...rest } = player;
      return rest;
    });
  },
});

// ========================================================================================
// Update
// ========================================================================================

export const updateIsReady = mutation({
  args: {
    ...SessionIdArg,
    gameId: v.id("games"),
    isReady: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_gameId_and_sessionId", (q) =>
        q.eq("gameId", args.gameId).eq("sessionId", args.sessionId),
      )
      .unique();
    if (!player) throw new ConvexError("Player not found.");
    await ctx.db.patch(player._id, { isReady: args.isReady });

    // Check if all players are now ready to start the game.
    // Guard against concurrent readying — if two players ready up at the same
    // time, both mutations will read status as "lobby", but only the first to
    // commit will schedule generation. The second will see "generating" here.
    if (args.isReady) {
      const game = await ctx.db.get(args.gameId);
      if (!game) throw new ConvexError("Game not found.");
      if (game.status !== "lobby") return;

      const players = await ctx.db
        .query("players")
        .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
        .collect();
      const allReady = players.every((p) =>
        p._id === player._id ? true : p.isReady,
      );
      if (!allReady) return;
      // Generate questions.
      await ctx.db.patch(args.gameId, { status: "generating" });
      await ctx.scheduler.runAfter(0, internal.quizmaster.generateQuestions, {
        gameId: args.gameId,
      });
    }
  },
});

export const updateCharacter = mutation({
  args: {
    gameId: v.id("games"),
    character: characterValidator,
    ...SessionIdArg,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_gameId_and_sessionId", (q) =>
        q.eq("gameId", args.gameId).eq("sessionId", args.sessionId),
      )
      .unique();
    if (!player) throw new ConvexError("Player not found.");

    // Check the character isn't taken by another player.
    const existing = await ctx.db
      .query("players")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
    const taken = existing.some(
      (p) => p._id !== player._id && p.character === args.character,
    );
    if (taken) throw new ConvexError("Character already taken.");

    await ctx.db.patch(player._id, { character: args.character });
  },
});
