import type { SessionId } from "convex-helpers/server/sessions";
import { convexTest } from "convex-test";
import { describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const SESSION_1 = "session-1" as unknown as SessionId;
const SESSION_2 = "session-2" as unknown as SessionId;
const STRANGER = "stranger" as unknown as SessionId;

// Creates one active/answering game with one question and two players.
async function setupActiveGameWithPlayers(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const gameId = await ctx.db.insert("games", {
      code: "XXXXXX",
      status: "active",
      phase: "answering",
      quizMovie: null,
      quizTone: "standard",
      quizTheme: "fun-facts",
      questionCount: 5,
      timeLimitSeconds: 30,
      currentQuestionIndex: 0,
      roundEndsAt: undefined,
    });
    const playerId = await ctx.db.insert("players", {
      gameId,
      sessionId: SESSION_1,
      character: "red",
      isReady: true,
    });
    await ctx.db.insert("players", {
      gameId,
      sessionId: SESSION_2,
      character: "blue",
      isReady: true,
    });
    await ctx.db.insert("questions", {
      gameId,
      index: 0,
      text: "Which film won Best Picture in 1994?",
      choices: [
        { label: "A", text: "Forrest Gump" },
        { label: "B", text: "Pulp Fiction" },
        { label: "C", text: "The Shawshank Redemption" },
        { label: "D", text: "Four Weddings and a Funeral" },
      ],
      correctLabel: "A",
    });
    return { gameId, playerId };
  });
}

describe("answers.submit", () => {
  it("returns null when game status is not active", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameWithPlayers(t);

    await t.run((ctx) => ctx.db.patch(gameId, { status: "lobby" }));

    const result = await t.mutation(api.answers.submit, {
      sessionId: SESSION_1,
      gameId,
      selectedLabel: "A",
    });

    expect(result).toBeNull();

    const answerCount = await t.run((ctx) =>
      ctx.db
        .query("answers")
        .collect()
        .then((r) => r.length),
    );
    expect(answerCount).toBe(0);
  });

  it("returns null when game phase is not answering", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameWithPlayers(t);

    await t.run((ctx) => ctx.db.patch(gameId, { phase: "results" }));

    const result = await t.mutation(api.answers.submit, {
      sessionId: SESSION_1,
      gameId,
      selectedLabel: "A",
    });

    expect(result).toBeNull();
  });

  it("throws when game is not found", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameWithPlayers(t);

    // Delete the game to get a valid-typed but missing id.
    await t.run((ctx) => ctx.db.delete(gameId));

    await expect(
      t.mutation(api.answers.submit, {
        sessionId: SESSION_1,
        gameId,
        selectedLabel: "A",
      }),
    ).rejects.toThrowError("Game not found.");
  });

  it("throws when the caller is not a participant", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameWithPlayers(t);

    await expect(
      t.mutation(api.answers.submit, {
        sessionId: STRANGER,
        gameId,
        selectedLabel: "A",
      }),
    ).rejects.toThrowError("Not a participant.");
  });

  it("throws when the selected label is not a valid choice", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameWithPlayers(t);

    await expect(
      t.mutation(api.answers.submit, {
        sessionId: SESSION_1,
        gameId,
        selectedLabel: "Z",
      }),
    ).rejects.toThrowError("Invalid choice label.");
  });

  it("inserts a correct answer when the selected label matches correctLabel", async () => {
    const t = convexTest(schema, modules);
    const { gameId, playerId } = await setupActiveGameWithPlayers(t);

    await t.mutation(api.answers.submit, {
      sessionId: SESSION_1,
      gameId,
      selectedLabel: "A",
    });

    const answer = await t.run((ctx) => ctx.db.query("answers").first());
    expect(answer).toMatchObject({
      playerId,
      selectedLabel: "A",
      isCorrect: true,
    });
  });

  it("inserts an incorrect answer when the selected label does not match correctLabel", async () => {
    const t = convexTest(schema, modules);
    const { gameId, playerId } = await setupActiveGameWithPlayers(t);

    await t.mutation(api.answers.submit, {
      sessionId: SESSION_1,
      gameId,
      selectedLabel: "B",
    });

    const answer = await t.run((ctx) => ctx.db.query("answers").first());
    expect(answer).toMatchObject({
      playerId,
      selectedLabel: "B",
      isCorrect: false,
    });
  });

  it("updates the existing answer when the player re-submits", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameWithPlayers(t);

    await t.mutation(api.answers.submit, {
      sessionId: SESSION_1,
      gameId,
      selectedLabel: "A",
    });
    await t.mutation(api.answers.submit, {
      sessionId: SESSION_1,
      gameId,
      selectedLabel: "B",
    });

    const answers = await t.run((ctx) => ctx.db.query("answers").collect());
    expect(answers).toHaveLength(1);
    expect(answers[0]).toMatchObject({ selectedLabel: "B", isCorrect: false });
  });

  it("does not schedule endAnswering when not all players have answered", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameWithPlayers(t);

    // Only session-1 answers; session-2 does not.
    await t.mutation(api.answers.submit, {
      sessionId: SESSION_1,
      gameId,
      selectedLabel: "A",
    });

    // answerCount (1) < players.length (2), so nothing should be scheduled.
    const scheduled = await t.run((ctx) =>
      ctx.db.system.query("_scheduled_functions").collect(),
    );
    expect(scheduled).toHaveLength(0);
  });

  it("schedules endAnswering when the last player submits", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameWithPlayers(t);

    // Intercept the 0ms endAnswering timer before it fires. Without this,
    // the timer would fire after the test resolves and write to the
    // convex-test database outside a transaction, causing unhandled errors.
    vi.useFakeTimers();

    try {
      await t.mutation(api.answers.submit, {
        sessionId: SESSION_1,
        gameId,
        selectedLabel: "A",
      });
      await t.mutation(api.answers.submit, {
        sessionId: SESSION_2,
        gameId,
        selectedLabel: "B",
      });

      // answerCount (2) >= players.length (2): endAnswering should be queued.
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
