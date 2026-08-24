import type { SessionId } from "convex-helpers/server/sessions";
import { convexTest } from "convex-test";
import { describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import { CHARACTER_OPTIONS } from "./fields/character";
import { EXPLANATION_DURATION_SECONDS } from "./fields/gameSettings";
import schema from "./schema";
import { modules } from "./test.setup";

const GAME_CODE = "XXXXXX";
const SESSION_1 = "session-1" as unknown as SessionId;
const SESSION_2 = "session-2" as unknown as SessionId;
const STRANGER = "stranger" as unknown as SessionId;

const BASE_GAME = {
  code: GAME_CODE,
  status: "lobby",
  quizAnimal: "dogs",
  quizModel: "openai/gpt-5.6-luna",
  quizTone: "standard",
  quizTheme: "diet-and-nutrition",
  questionCount: 5,
  timeLimitSeconds: 30,
  currentQuestionIndex: 0,
};

// Creates one game in lobby status with no players.
async function setupLobbyGame(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const gameId = await ctx.db.insert("games", BASE_GAME);
    return { gameId };
  });
}

// Creates one game in lobby status with two players (both isReady: false).
async function setupLobbyGameWithPlayers(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const gameId = await ctx.db.insert("games", BASE_GAME);
    const player1Id = await ctx.db.insert("players", {
      gameId,
      sessionId: SESSION_1,
      character: "apricot",
      isReady: false,
    });
    await ctx.db.insert("players", {
      gameId,
      sessionId: SESSION_2,
      character: "aqua",
      isReady: false,
    });
    return { gameId, player1Id };
  });
}

// Creates one active explanation game with two players.
async function setupExplanationGameWithPlayers(
  t: ReturnType<typeof convexTest>,
) {
  return t.run(async (ctx) => {
    const gameId = await ctx.db.insert("games", {
      ...BASE_GAME,
      status: "active",
      phase: "explanation",
      roundEndsAt: Date.now() + EXPLANATION_DURATION_SECONDS * 1000,
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

describe("players.join", () => {
  it("throws when game code is invalid", async () => {
    const t = convexTest(schema, modules);
    await setupLobbyGame(t);

    await expect(
      t.mutation(api.players.join, {
        sessionId: SESSION_1,
        code: "ABC",
      }),
    ).rejects.toThrowError();
  });

  it("throws when game not found", async () => {
    const t = convexTest(schema, modules);
    await setupLobbyGame(t);

    await expect(
      t.mutation(api.players.join, {
        sessionId: SESSION_1,
        code: "YYYYYY",
      }),
    ).rejects.toThrowError("Game not found.");
  });

  it("throws when game is not in lobby", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupLobbyGame(t);

    await t.run((ctx) => ctx.db.patch(gameId, { status: "active" }));

    await expect(
      t.mutation(api.players.join, {
        sessionId: SESSION_1,
        code: GAME_CODE,
      }),
    ).rejects.toThrowError("Game is not in lobby.");
  });

  it("throws when game is full", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupLobbyGame(t);

    // Fill all character slots so the game is at capacity.
    await t.run(async (ctx) => {
      for (const option of CHARACTER_OPTIONS) {
        await ctx.db.insert("players", {
          gameId,
          sessionId: `filler-${option.value}`,
          character: option.value,
          isReady: false,
        });
      }
    });

    await expect(
      t.mutation(api.players.join, {
        sessionId: SESSION_1,
        code: GAME_CODE,
      }),
    ).rejects.toThrowError("Game is full.");
  });

  it("returns null when player already joined", async () => {
    const t = convexTest(schema, modules);
    await setupLobbyGame(t);

    // First join.
    await t.mutation(api.players.join, {
      sessionId: SESSION_1,
      code: GAME_CODE,
    });

    // Second join with the same session should return null.
    const result = await t.mutation(api.players.join, {
      sessionId: SESSION_1,
      code: GAME_CODE,
    });

    expect(result).toBeNull();

    const playerCount = await t.run((ctx) =>
      ctx.db
        .query("players")
        .collect()
        .then((r) => r.length),
    );
    expect(playerCount).toBe(1);
  });

  it("inserts player with valid character and isReady: false", async () => {
    const t = convexTest(schema, modules);
    await setupLobbyGame(t);

    await t.mutation(api.players.join, {
      sessionId: SESSION_1,
      code: GAME_CODE,
    });

    const player = await t.run((ctx) => ctx.db.query("players").first());
    const validCharacters = CHARACTER_OPTIONS.map((o) => o.value);

    expect(player).not.toBeNull();
    expect(player?.isReady).toBe(false);
    expect(validCharacters).toContain(player?.character);
  });
});

describe("players.updateIsReady", () => {
  it("throws when player not found", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupLobbyGameWithPlayers(t);

    await expect(
      t.mutation(api.players.updateIsReady, {
        sessionId: STRANGER,
        gameId,
        isReady: true,
      }),
    ).rejects.toThrowError("Player not found.");
  });

  it("updates isReady to true", async () => {
    const t = convexTest(schema, modules);
    const { gameId, player1Id } = await setupLobbyGameWithPlayers(t);

    await t.mutation(api.players.updateIsReady, {
      sessionId: SESSION_1,
      gameId,
      isReady: true,
    });

    const player = await t.run((ctx) => ctx.db.get(player1Id));
    expect(player?.isReady).toBe(true);
  });

  it("updates isReady to false", async () => {
    const t = convexTest(schema, modules);
    const { gameId, player1Id } = await setupLobbyGameWithPlayers(t);

    // Mark ready then un-ready.
    await t.mutation(api.players.updateIsReady, {
      sessionId: SESSION_1,
      gameId,
      isReady: true,
    });
    await t.mutation(api.players.updateIsReady, {
      sessionId: SESSION_1,
      gameId,
      isReady: false,
    });

    const player = await t.run((ctx) => ctx.db.get(player1Id));
    expect(player?.isReady).toBe(false);
  });

  it("does not schedule when isReady is false", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupLobbyGameWithPlayers(t);

    await t.mutation(api.players.updateIsReady, {
      sessionId: SESSION_1,
      gameId,
      isReady: false,
    });

    const scheduled = await t.run((ctx) =>
      ctx.db.system.query("_scheduled_functions").collect(),
    );
    expect(scheduled).toHaveLength(0);
  });

  it("does not schedule when game is not in lobby status", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupLobbyGameWithPlayers(t);

    await t.run((ctx) => ctx.db.patch(gameId, { status: "generating" }));

    await t.mutation(api.players.updateIsReady, {
      sessionId: SESSION_1,
      gameId,
      isReady: true,
    });
    await t.mutation(api.players.updateIsReady, {
      sessionId: SESSION_2,
      gameId,
      isReady: true,
    });

    const scheduled = await t.run((ctx) =>
      ctx.db.system.query("_scheduled_functions").collect(),
    );
    expect(scheduled).toHaveLength(0);
  });

  it("does not schedule when not all players are ready", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupLobbyGameWithPlayers(t);

    // Only session-1 marks ready; session-2 does not.
    await t.mutation(api.players.updateIsReady, {
      sessionId: SESSION_1,
      gameId,
      isReady: true,
    });

    const scheduled = await t.run((ctx) =>
      ctx.db.system.query("_scheduled_functions").collect(),
    );
    expect(scheduled).toHaveLength(0);
  });

  it("schedules generateQuestions and sets status to generating when last player marks ready", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupLobbyGameWithPlayers(t);
    await t.run((ctx) =>
      ctx.db.patch(gameId, { quizGenerationFailedAt: Date.now() }),
    );

    // Intercept the 0ms scheduler timer before it fires.
    vi.useFakeTimers();

    try {
      await t.mutation(api.players.updateIsReady, {
        sessionId: SESSION_1,
        gameId,
        isReady: true,
      });
      await t.mutation(api.players.updateIsReady, {
        sessionId: SESSION_2,
        gameId,
        isReady: true,
      });

      const scheduled = await t.run((ctx) =>
        ctx.db.system.query("_scheduled_functions").collect(),
      );
      expect(scheduled).toHaveLength(1);
      expect(scheduled[0]?.state.kind).toBe("pending");

      const game = await t.run((ctx) => ctx.db.get(gameId));
      expect(game?.status).toBe("generating");
      expect(game?.quizGenerationFailedAt).toBeUndefined();
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});

describe("players.markReadyForNextQuestion", () => {
  it("throws when the session is not a participant", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupExplanationGameWithPlayers(t);

    await expect(
      t.mutation(api.players.markReadyForNextQuestion, {
        sessionId: STRANGER,
        gameId,
        expectedIndex: 0,
      }),
    ).rejects.toThrowError("Not a participant.");
  });

  it("ignores a vote outside the explanation phase", async () => {
    const t = convexTest(schema, modules);
    const { gameId, player1Id } = await setupExplanationGameWithPlayers(t);
    await t.run((ctx) => ctx.db.patch(gameId, { phase: "results" }));

    await t.mutation(api.players.markReadyForNextQuestion, {
      sessionId: SESSION_1,
      gameId,
      expectedIndex: 0,
    });

    const player = await t.run((ctx) => ctx.db.get(player1Id));
    expect(player?.readyForNextQuestionIndex).toBeUndefined();
  });

  it("ignores a vote for a stale question index", async () => {
    const t = convexTest(schema, modules);
    const { gameId, player1Id } = await setupExplanationGameWithPlayers(t);

    await t.mutation(api.players.markReadyForNextQuestion, {
      sessionId: SESSION_1,
      gameId,
      expectedIndex: 1,
    });

    const player = await t.run((ctx) => ctx.db.get(player1Id));
    expect(player?.readyForNextQuestionIndex).toBeUndefined();
  });

  it("stores an indexed vote without advancing early", async () => {
    const t = convexTest(schema, modules);
    const { gameId, player1Id } = await setupExplanationGameWithPlayers(t);

    await t.mutation(api.players.markReadyForNextQuestion, {
      sessionId: SESSION_1,
      gameId,
      expectedIndex: 0,
    });

    const player = await t.run((ctx) => ctx.db.get(player1Id));
    const scheduled = await t.run((ctx) =>
      ctx.db.system.query("_scheduled_functions").collect(),
    );
    expect(player?.readyForNextQuestionIndex).toBe(0);
    expect(scheduled).toHaveLength(0);
  });

  it("schedules advancement when every player has voted", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupExplanationGameWithPlayers(t);
    vi.useFakeTimers();

    try {
      await t.mutation(api.players.markReadyForNextQuestion, {
        sessionId: SESSION_1,
        gameId,
        expectedIndex: 0,
      });
      await t.mutation(api.players.markReadyForNextQuestion, {
        sessionId: SESSION_2,
        gameId,
        expectedIndex: 0,
      });

      const scheduled = await t.run((ctx) =>
        ctx.db.system.query("_scheduled_functions").collect(),
      );
      expect(scheduled).toHaveLength(1);
      expect(scheduled[0]?.state.kind).toBe("pending");
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("does not schedule twice when the last player repeats a vote", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupExplanationGameWithPlayers(t);
    vi.useFakeTimers();

    try {
      await t.mutation(api.players.markReadyForNextQuestion, {
        sessionId: SESSION_1,
        gameId,
        expectedIndex: 0,
      });
      await t.mutation(api.players.markReadyForNextQuestion, {
        sessionId: SESSION_2,
        gameId,
        expectedIndex: 0,
      });
      await t.mutation(api.players.markReadyForNextQuestion, {
        sessionId: SESSION_2,
        gameId,
        expectedIndex: 0,
      });

      const scheduled = await t.run((ctx) =>
        ctx.db.system.query("_scheduled_functions").collect(),
      );
      expect(scheduled).toHaveLength(1);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("does not count a vote from an earlier question", async () => {
    const t = convexTest(schema, modules);
    const { gameId, player1Id } = await setupExplanationGameWithPlayers(t);
    await t.run((ctx) =>
      ctx.db.patch(player1Id, { readyForNextQuestionIndex: -1 }),
    );

    await t.mutation(api.players.markReadyForNextQuestion, {
      sessionId: SESSION_2,
      gameId,
      expectedIndex: 0,
    });

    const scheduled = await t.run((ctx) =>
      ctx.db.system.query("_scheduled_functions").collect(),
    );
    expect(scheduled).toHaveLength(0);
  });

  it("schedules immediate advancement for a solo player", async () => {
    const t = convexTest(schema, modules);
    const { gameId, player2Id } = await setupExplanationGameWithPlayers(t);
    await t.run((ctx) => ctx.db.delete(player2Id));
    vi.useFakeTimers();

    try {
      await t.mutation(api.players.markReadyForNextQuestion, {
        sessionId: SESSION_1,
        gameId,
        expectedIndex: 0,
      });

      const scheduled = await t.run((ctx) =>
        ctx.db.system.query("_scheduled_functions").collect(),
      );
      expect(scheduled).toHaveLength(1);
      expect(scheduled[0]?.state.kind).toBe("pending");
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});
