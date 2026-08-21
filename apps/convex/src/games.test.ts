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
      quizModel: "anthropic/claude-sonnet-5",
      quizTone: "wholesome",
      quizTheme: "health-and-wellbeing",
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
  it("finds a game when the code uses lowercase letters", async () => {
    const t = convexTest(schema, modules);
    const gameId = await t.run((ctx) =>
      ctx.db.insert("games", {
        code: "3PS28N",
        status: "lobby",
        quizAnimal: "dogs",
        quizModel: "openai/gpt-5.6-luna",
        quizTone: "standard",
        quizTheme: "diet-and-nutrition",
        questionCount: 5,
        timeLimitSeconds: 30,
        currentQuestionIndex: 0,
      }),
    );

    const game = await t.query(api.games.byCode, { code: "3PS28n" });

    expect(game?._id).toBe(gameId);
    expect(game?.code).toBe("3PS28N");
  });

  it("creates a game with the default animal and model", async () => {
    const t = convexTest(schema, modules);

    const code = await t.mutation(api.games.create, { sessionId: SESSION_1 });
    const game = await t.query(api.games.byCode, { code });

    expect(game?.quizAnimal).toBe("dogs");
    expect(game?.quizModel).toBe("openai/gpt-5.6-luna");
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

  it("stores the selected quiz model", async () => {
    const t = convexTest(schema, modules);

    const code = await t.mutation(api.games.create, { sessionId: SESSION_1 });
    const game = await t.query(api.games.byCode, { code });
    if (!game) throw new Error("Game not found.");

    await t.mutation(api.games.updateQuizModel, {
      sessionId: SESSION_1,
      gameId: game._id,
      quizModel: "google/gemini-2.5-flash-lite",
    });

    const updatedGame = await t.query(api.games.byCode, { code });
    expect(updatedGame?.quizModel).toBe("google/gemini-2.5-flash-lite");
  });

  it("updates game settings for a participant", async () => {
    const t = convexTest(schema, modules);

    const code = await t.mutation(api.games.create, { sessionId: SESSION_1 });
    const game = await t.query(api.games.byCode, { code });
    if (!game) throw new Error("Game not found.");

    await t.mutation(api.games.updateQuestionCount, {
      sessionId: SESSION_1,
      gameId: game._id,
      questionCount: 15,
    });
    await t.mutation(api.games.updateTimeLimitSeconds, {
      sessionId: SESSION_1,
      gameId: game._id,
      timeLimitSeconds: 90,
    });

    const updatedGame = await t.query(api.games.byCode, { code });
    expect(updatedGame).toMatchObject({
      questionCount: 15,
      timeLimitSeconds: 90,
    });
  });

  it("rejects unsupported game setting values", async () => {
    const t = convexTest(schema, modules);

    const code = await t.mutation(api.games.create, { sessionId: SESSION_1 });
    const game = await t.query(api.games.byCode, { code });
    if (!game) throw new Error("Game not found.");

    await expect(
      t.mutation(api.games.updateQuestionCount, {
        sessionId: SESSION_1,
        gameId: game._id,
        questionCount: 7 as 5,
      }),
    ).rejects.toThrow();
    await expect(
      t.mutation(api.games.updateTimeLimitSeconds, {
        sessionId: SESSION_1,
        gameId: game._id,
        timeLimitSeconds: 45 as 30,
      }),
    ).rejects.toThrow();
    await expect(
      t.mutation(api.games.updateQuizModel, {
        sessionId: SESSION_1,
        gameId: game._id,
        quizModel: "unsupported/model" as "openai/gpt-5.6-luna",
      }),
    ).rejects.toThrow();
  });

  it("rejects game setting updates from non-participants", async () => {
    const t = convexTest(schema, modules);

    const code = await t.mutation(api.games.create, { sessionId: SESSION_1 });
    const game = await t.query(api.games.byCode, { code });
    if (!game) throw new Error("Game not found.");

    await expect(
      t.mutation(api.games.updateQuestionCount, {
        sessionId: STRANGER,
        gameId: game._id,
        questionCount: 15,
      }),
    ).rejects.toThrowError("Not a participant.");
  });
});

describe("games.playAgain", () => {
  it("copies the settings and character into the replay game", async () => {
    const t = convexTest(schema, modules);
    const { gameId, player1Id } = await setupFinishedGame(t);

    const code = await t.mutation(api.games.playAgain, {
      sessionId: SESSION_1,
      gameId,
    });

    const replayGame = await t.query(api.games.byCode, { code });
    expect(replayGame).toMatchObject({
      status: "lobby",
      quizAnimal: "cats",
      quizModel: "anthropic/claude-sonnet-5",
      quizTone: "wholesome",
      quizTheme: "health-and-wellbeing",
      questionCount: 5,
      timeLimitSeconds: 30,
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
      character: "apricot",
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
    expect(state.replayPlayers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sessionId: SESSION_1,
          character: "apricot",
        }),
        expect.objectContaining({
          sessionId: SESSION_2,
          character: "aqua",
        }),
      ]),
    );
  });

  it("uses an available character when the preferred one is taken", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupFinishedGame(t);

    const code = await t.mutation(api.games.playAgain, {
      sessionId: SESSION_1,
      gameId,
    });
    const replayGame = await t.query(api.games.byCode, { code });
    if (!replayGame) throw new Error("Replay game not found.");

    await t.mutation(api.players.updateCharacter, {
      sessionId: SESSION_1,
      gameId: replayGame._id,
      character: "aqua",
    });
    await t.mutation(api.games.playAgain, {
      sessionId: SESSION_2,
      gameId,
    });

    const replayPlayers = await t.run((ctx) =>
      ctx.db
        .query("players")
        .withIndex("by_gameId", (q) => q.eq("gameId", replayGame._id))
        .collect(),
    );
    const firstPlayer = replayPlayers.find(
      (player) => player.sessionId === SESSION_1,
    );
    const secondPlayer = replayPlayers.find(
      (player) => player.sessionId === SESSION_2,
    );

    expect(firstPlayer?.character).toBe("aqua");
    expect(secondPlayer?.character).not.toBe("aqua");
    expect(secondPlayer?.character).toBeDefined();
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
