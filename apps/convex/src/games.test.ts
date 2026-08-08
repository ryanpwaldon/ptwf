import type { SessionId } from "convex-helpers/server/sessions";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const SESSION_1 = "session-1" as unknown as SessionId;
const SESSION_2 = "session-2" as unknown as SessionId;
const STRANGER = "stranger" as unknown as SessionId;

async function setupFinishedGame(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const gameId = await ctx.db.insert("games", {
      code: "FINISH",
      status: "finished",
      quizAnimal: "cats",
      quizTone: "standard",
      quizTheme: "diet-and-nutrition",
      questionCount: 5,
      timeLimitSeconds: 30,
      currentQuestionIndex: 4,
    });
    const player1Id = await ctx.db.insert("players", {
      gameId,
      sessionId: SESSION_1,
      character: "apricot",
      isReady: true,
    });
    const player2Id = await ctx.db.insert("players", {
      gameId,
      sessionId: SESSION_2,
      character: "aqua",
      isReady: true,
    });
    return { gameId, player1Id, player2Id };
  });
}

describe("games", () => {
  it("creates a game with dogs selected by default", async () => {
    const t = convexTest(schema, modules);

    const code = await t.mutation(api.games.create, { sessionId: SESSION_1 });
    const game = await t.query(api.games.byCode, { code });

    expect(game?.quizAnimal).toBe("dogs");
  });

  it("stores only the selected animal value", async () => {
    const t = convexTest(schema, modules);

    const code = await t.mutation(api.games.create, { sessionId: SESSION_1 });
    const game = await t.query(api.games.byCode, { code });
    if (!game) throw new Error("Game not found.");

    await t.mutation(api.games.updateQuizAnimal, {
      sessionId: SESSION_1,
      gameId: game._id,
      quizAnimal: "cats",
    });

    const updatedGame = await t.query(api.games.byCode, { code });
    expect(updatedGame?.quizAnimal).toBe("cats");
  });
});

describe("games.playAgain", () => {
  it("creates a new default game and joins the first player", async () => {
    const t = convexTest(schema, modules);
    const { gameId, player1Id } = await setupFinishedGame(t);

    const code = await t.mutation(api.games.playAgain, {
      sessionId: SESSION_1,
      gameId,
    });

    const replayGame = await t.query(api.games.byCode, { code });
    expect(replayGame).toMatchObject({
      status: "lobby",
      quizAnimal: "dogs",
      quizTone: "standard",
      quizTheme: "diet-and-nutrition",
      questionCount: 10,
      timeLimitSeconds: 60,
    });

    const state = await t.run(async (ctx) => ({
      originalGame: await ctx.db.get(gameId),
      originalPlayer: await ctx.db.get(player1Id),
      replayPlayers: replayGame
        ? await ctx.db
            .query("players")
            .withIndex("by_gameId", (q) => q.eq("gameId", replayGame._id))
            .collect()
        : [],
    }));
    expect(state.originalGame?.replayGameId).toBe(replayGame?._id);
    expect(state.originalPlayer?.replayRequested).toBe(true);
    expect(state.replayPlayers).toHaveLength(1);
    expect(state.replayPlayers[0]).toMatchObject({
      sessionId: SESSION_1,
      isReady: false,
    });
  });

  it("joins later players to the same replay game", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupFinishedGame(t);

    const firstCode = await t.mutation(api.games.playAgain, {
      sessionId: SESSION_1,
      gameId,
    });
    const secondCode = await t.mutation(api.games.playAgain, {
      sessionId: SESSION_2,
      gameId,
    });

    expect(secondCode).toBe(firstCode);
    const state = await t.run(async (ctx) => {
      const games = await ctx.db.query("games").collect();
      const originalPlayers = await ctx.db
        .query("players")
        .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
        .collect();
      const replayGame = games.find((game) => game.code === firstCode);
      const replayPlayers = replayGame
        ? await ctx.db
            .query("players")
            .withIndex("by_gameId", (q) => q.eq("gameId", replayGame._id))
            .collect()
        : [];
      return { games, originalPlayers, replayPlayers };
    });
    expect(state.games).toHaveLength(2);
    expect(state.originalPlayers.filter((player) => player.replayRequested)).toHaveLength(2); // prettier-ignore
    expect(state.replayPlayers).toHaveLength(2);
    expect(new Set(state.replayPlayers.map((player) => player.character)).size).toBe(2); // prettier-ignore
  });

  it("does not duplicate a player's replay request", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupFinishedGame(t);

    const firstCode = await t.mutation(api.games.playAgain, {
      sessionId: SESSION_1,
      gameId,
    });
    const secondCode = await t.mutation(api.games.playAgain, {
      sessionId: SESSION_1,
      gameId,
    });

    expect(secondCode).toBe(firstCode);
    const counts = await t.run(async (ctx) => ({
      games: (await ctx.db.query("games").collect()).length,
      replayPlayers: (
        await ctx.db
          .query("players")
          .filter((q) => q.neq(q.field("gameId"), gameId))
          .collect()
      ).length,
    }));
    expect(counts).toEqual({ games: 2, replayPlayers: 1 });
  });

  it("uses one replay game for simultaneous first clicks", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupFinishedGame(t);

    const [firstCode, secondCode] = await Promise.all([
      t.mutation(api.games.playAgain, { sessionId: SESSION_1, gameId }),
      t.mutation(api.games.playAgain, { sessionId: SESSION_2, gameId }),
    ]);

    expect(secondCode).toBe(firstCode);
    const gameCount = await t.run((ctx) =>
      ctx.db
        .query("games")
        .collect()
        .then((games) => games.length),
    );
    expect(gameCount).toBe(2);
  });

  it("rejects requests from non-participants", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupFinishedGame(t);

    await expect(
      t.mutation(api.games.playAgain, {
        sessionId: STRANGER,
        gameId,
      }),
    ).rejects.toThrowError("Not a participant.");
  });

  it("rejects requests before the game is finished", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupFinishedGame(t);
    await t.run((ctx) => ctx.db.patch(gameId, { status: "active" }));

    await expect(
      t.mutation(api.games.playAgain, {
        sessionId: SESSION_1,
        gameId,
      }),
    ).rejects.toThrowError("Game is not finished.");
  });

  it("does not count a player when the replay has already started", async () => {
    const t = convexTest(schema, modules);
    const { gameId, player2Id } = await setupFinishedGame(t);
    await t.mutation(api.games.playAgain, {
      sessionId: SESSION_1,
      gameId,
    });
    const replayGameId = await t.run(async (ctx) => {
      const game = await ctx.db.get(gameId);
      if (!game?.replayGameId) throw new Error("Replay game not found.");
      await ctx.db.patch(game.replayGameId, { status: "generating" });
      return game.replayGameId;
    });

    await expect(
      t.mutation(api.games.playAgain, {
        sessionId: SESSION_2,
        gameId,
      }),
    ).rejects.toThrowError("Game is not in lobby.");

    const state = await t.run(async (ctx) => ({
      originalPlayer: await ctx.db.get(player2Id),
      replayPlayers: await ctx.db
        .query("players")
        .withIndex("by_gameId", (q) => q.eq("gameId", replayGameId))
        .collect(),
    }));
    expect(state.originalPlayer?.replayRequested).toBeUndefined();
    expect(state.replayPlayers).toHaveLength(1);
  });
});
