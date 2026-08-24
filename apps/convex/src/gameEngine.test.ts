import { convexTest } from "convex-test";
import { describe, expect, it, vi } from "vitest";

import { internal } from "./_generated/api";
import {
  EXPLANATION_DURATION_SECONDS,
  RESULTS_DURATION_SECONDS,
} from "./fields/gameSettings";
import schema from "./schema";
import { modules } from "./test.setup";

const BASE_QUESTION = {
  index: 0,
  text: "Sample question?",
  choices: [
    { label: "A", text: "Option A" },
    { label: "B", text: "Option B" },
  ],
  correctLabel: "A",
};

// Creates one active/answering game with one question.
async function setupActiveGameInAnsweringPhase(
  t: ReturnType<typeof convexTest>,
) {
  return t.run(async (ctx) => {
    const gameId = await ctx.db.insert("games", {
      code: "XXXXXX",
      status: "active",
      phase: "answering",
      quizAnimal: "dogs",
      quizModel: "openai/gpt-5.6-luna",
      quizTone: "standard",
      quizTheme: "diet-and-nutrition",
      questionCount: 2,
      timeLimitSeconds: 30,
      currentQuestionIndex: 0,
      roundEndsAt: Date.now() + 30_000,
    });
    const questionId = await ctx.db.insert("questions", {
      ...BASE_QUESTION,
      gameId,
    });
    return { gameId, questionId };
  });
}

// Creates one active/results game with one question.
async function setupActiveGameInResultsPhase(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const gameId = await ctx.db.insert("games", {
      code: "XXXXXX",
      status: "active",
      phase: "results",
      quizAnimal: "dogs",
      quizModel: "openai/gpt-5.6-luna",
      quizTone: "standard",
      quizTheme: "diet-and-nutrition",
      questionCount: 2,
      timeLimitSeconds: 30,
      currentQuestionIndex: 0,
      roundEndsAt: Date.now() + RESULTS_DURATION_SECONDS * 1000,
    });
    const questionId = await ctx.db.insert("questions", {
      ...BASE_QUESTION,
      gameId,
    });
    return { gameId, questionId };
  });
}

// Creates one active/explanation game with one question.
async function setupActiveGameInExplanationPhase(
  t: ReturnType<typeof convexTest>,
) {
  return t.run(async (ctx) => {
    const gameId = await ctx.db.insert("games", {
      code: "XXXXXX",
      status: "active",
      phase: "explanation",
      quizAnimal: "dogs",
      quizModel: "openai/gpt-5.6-luna",
      quizTone: "standard",
      quizTheme: "diet-and-nutrition",
      questionCount: 2,
      timeLimitSeconds: 30,
      currentQuestionIndex: 0,
      roundEndsAt: Date.now() + EXPLANATION_DURATION_SECONDS * 1000,
    });
    const questionId = await ctx.db.insert("questions", {
      ...BASE_QUESTION,
      gameId,
    });
    return { gameId, questionId };
  });
}

describe("gameEngine.endAnswering", () => {
  it("returns null when game not found", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInAnsweringPhase(t);

    await t.run((ctx) => ctx.db.delete(gameId));

    const result = await t.mutation(internal.gameEngine.endAnswering, {
      gameId,
      expectedIndex: 0,
    });

    expect(result).toBeNull();
  });

  it("returns null when status is not active", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInAnsweringPhase(t);

    await t.run((ctx) => ctx.db.patch(gameId, { status: "lobby" }));

    const result = await t.mutation(internal.gameEngine.endAnswering, {
      gameId,
      expectedIndex: 0,
    });

    expect(result).toBeNull();
  });

  it("returns null when phase is not answering", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInAnsweringPhase(t);

    await t.run((ctx) => ctx.db.patch(gameId, { phase: "results" }));

    const result = await t.mutation(internal.gameEngine.endAnswering, {
      gameId,
      expectedIndex: 0,
    });

    expect(result).toBeNull();
  });

  it("returns null when expectedIndex does not match currentQuestionIndex", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInAnsweringPhase(t);

    const result = await t.mutation(internal.gameEngine.endAnswering, {
      gameId,
      expectedIndex: 1,
    });

    expect(result).toBeNull();
  });

  it("sets phase to results with a results deadline", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInAnsweringPhase(t);
    const beforeMutation = Date.now();

    await t.mutation(internal.gameEngine.endAnswering, {
      gameId,
      expectedIndex: 0,
    });

    const afterMutation = Date.now();
    const game = await t.run((ctx) => ctx.db.get(gameId));
    expect(game?.phase).toBe("results");
    expect(game?.roundEndsAt).toBeGreaterThanOrEqual(
      beforeMutation + RESULTS_DURATION_SECONDS * 1000,
    );
    expect(game?.roundEndsAt).toBeLessThanOrEqual(
      afterMutation + RESULTS_DURATION_SECONDS * 1000,
    );
  });

  it("schedules showExplanation", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInAnsweringPhase(t);

    vi.useFakeTimers();

    try {
      await t.mutation(internal.gameEngine.endAnswering, {
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

describe("gameEngine.showExplanation", () => {
  it("returns null when game not found", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInResultsPhase(t);

    await t.run((ctx) => ctx.db.delete(gameId));

    const result = await t.mutation(internal.gameEngine.showExplanation, {
      gameId,
      expectedIndex: 0,
    });

    expect(result).toBeNull();
  });

  it("returns null when status is not active", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInResultsPhase(t);

    await t.run((ctx) => ctx.db.patch(gameId, { status: "lobby" }));

    const result = await t.mutation(internal.gameEngine.showExplanation, {
      gameId,
      expectedIndex: 0,
    });

    expect(result).toBeNull();
  });

  it("returns null when phase is not results", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInResultsPhase(t);

    await t.run((ctx) => ctx.db.patch(gameId, { phase: "answering" }));

    const result = await t.mutation(internal.gameEngine.showExplanation, {
      gameId,
      expectedIndex: 0,
    });

    expect(result).toBeNull();
  });

  it("returns null when expectedIndex does not match currentQuestionIndex", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInResultsPhase(t);

    const result = await t.mutation(internal.gameEngine.showExplanation, {
      gameId,
      expectedIndex: 1,
    });

    expect(result).toBeNull();
  });

  it("sets phase to explanation with an explanation deadline", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInResultsPhase(t);
    const beforeMutation = Date.now();

    await t.mutation(internal.gameEngine.showExplanation, {
      gameId,
      expectedIndex: 0,
    });

    const afterMutation = Date.now();
    const game = await t.run((ctx) => ctx.db.get(gameId));
    expect(game?.phase).toBe("explanation");
    expect(game?.roundEndsAt).toBeGreaterThanOrEqual(
      beforeMutation + EXPLANATION_DURATION_SECONDS * 1000,
    );
    expect(game?.roundEndsAt).toBeLessThanOrEqual(
      afterMutation + EXPLANATION_DURATION_SECONDS * 1000,
    );
  });

  it("schedules advanceQuestion", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInResultsPhase(t);

    vi.useFakeTimers();

    try {
      await t.mutation(internal.gameEngine.showExplanation, {
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

describe("gameEngine.advanceQuestion", () => {
  it("returns null when game not found", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInExplanationPhase(t);

    await t.run((ctx) => ctx.db.delete(gameId));

    const result = await t.mutation(internal.gameEngine.advanceQuestion, {
      gameId,
      expectedIndex: 0,
    });

    expect(result).toBeNull();
  });

  it("returns null when status is not active", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInExplanationPhase(t);

    await t.run((ctx) => ctx.db.patch(gameId, { status: "lobby" }));

    const result = await t.mutation(internal.gameEngine.advanceQuestion, {
      gameId,
      expectedIndex: 0,
    });

    expect(result).toBeNull();
  });

  it("returns null when phase is not explanation", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInExplanationPhase(t);

    await t.run((ctx) => ctx.db.patch(gameId, { phase: "results" }));

    const result = await t.mutation(internal.gameEngine.advanceQuestion, {
      gameId,
      expectedIndex: 0,
    });

    expect(result).toBeNull();
  });

  it("returns null when expectedIndex does not match currentQuestionIndex", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await setupActiveGameInExplanationPhase(t);

    const result = await t.mutation(internal.gameEngine.advanceQuestion, {
      gameId,
      expectedIndex: 1,
    });

    expect(result).toBeNull();
  });

  it("ends game when on the last question", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await t.run(async (ctx) => {
      const gameId = await ctx.db.insert("games", {
        code: "XXXXXX",
        status: "active",
        phase: "explanation",
        quizAnimal: "dogs",
        quizModel: "openai/gpt-5.6-luna",
        quizTone: "standard",
        quizTheme: "diet-and-nutrition",
        questionCount: 1,
        timeLimitSeconds: 30,
        currentQuestionIndex: 0,
      });
      await ctx.db.insert("questions", { ...BASE_QUESTION, gameId });
      return { gameId };
    });

    await t.mutation(internal.gameEngine.advanceQuestion, {
      gameId,
      expectedIndex: 0,
    });

    const game = await t.run((ctx) => ctx.db.get(gameId));
    expect(game?.status).toBe("finished");
    expect(game?.phase).toBeUndefined();
    expect(game?.roundEndsAt).toBeUndefined();

    const scheduled = await t.run((ctx) =>
      ctx.db.system.query("_scheduled_functions").collect(),
    );
    expect(scheduled).toHaveLength(0);
  });

  it("advances to next question and schedules endAnswering", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await t.run(async (ctx) => {
      const gameId = await ctx.db.insert("games", {
        code: "XXXXXX",
        status: "active",
        phase: "explanation",
        quizAnimal: "dogs",
        quizModel: "openai/gpt-5.6-luna",
        quizTone: "standard",
        quizTheme: "diet-and-nutrition",
        questionCount: 2,
        timeLimitSeconds: 30,
        currentQuestionIndex: 0,
      });
      await ctx.db.insert("questions", { ...BASE_QUESTION, gameId });
      await ctx.db.insert("questions", {
        ...BASE_QUESTION,
        index: 1,
        text: "Second question?",
        gameId,
      });
      return { gameId };
    });

    vi.useFakeTimers();

    try {
      await t.mutation(internal.gameEngine.advanceQuestion, {
        gameId,
        expectedIndex: 0,
      });

      const game = await t.run((ctx) => ctx.db.get(gameId));
      expect(game?.phase).toBe("answering");
      expect(game?.currentQuestionIndex).toBe(1);
      expect(typeof game?.roundEndsAt).toBe("number");

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

describe("gameEngine.saveQuestions", () => {
  const BASE_GENERATING_GAME = {
    code: "XXXXXX",
    status: "generating",
    quizAnimal: "dogs",
    quizModel: "openai/gpt-5.6-luna",
    quizTone: "standard",
    quizTheme: "diet-and-nutrition",
    questionCount: 2,
    timeLimitSeconds: 30,
    currentQuestionIndex: 0,
  } as const;

  const TEST_QUESTIONS = [
    {
      text: "First question?",
      choices: [
        { label: "A", text: "Option A" },
        { label: "B", text: "Option B" },
      ],
      correctLabel: "A",
    },
    {
      text: "Second question?",
      choices: [
        { label: "A", text: "Option A" },
        { label: "B", text: "Option B" },
      ],
      correctLabel: "B",
    },
  ];

  it("inserts questions with correct index and gameId", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await t.run(async (ctx) => {
      const gameId = await ctx.db.insert("games", BASE_GENERATING_GAME);
      return { gameId };
    });

    await t.mutation(internal.gameEngine.saveQuestions, {
      gameId,
      questions: TEST_QUESTIONS,
    });

    const questions = await t.run((ctx) =>
      ctx.db
        .query("questions")
        .withIndex("by_gameId_and_index", (q) => q.eq("gameId", gameId))
        .collect(),
    );

    expect(questions).toHaveLength(2);
    expect(questions[0]?.index).toBe(0);
    expect(questions[0]?.gameId).toBe(gameId);
    expect(questions[0]?.text).toBe("First question?");
    expect(questions[0]?.correctLabel).toBe("A");
    expect(questions[1]?.index).toBe(1);
    expect(questions[1]?.gameId).toBe(gameId);
    expect(questions[1]?.text).toBe("Second question?");
    expect(questions[1]?.correctLabel).toBe("B");
  });

  it("transitions game to active answering phase", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await t.run(async (ctx) => {
      const gameId = await ctx.db.insert("games", BASE_GENERATING_GAME);
      return { gameId };
    });

    await t.mutation(internal.gameEngine.saveQuestions, {
      gameId,
      questions: TEST_QUESTIONS,
    });

    const game = await t.run((ctx) => ctx.db.get(gameId));
    expect(game?.status).toBe("active");
    expect(game?.phase).toBe("answering");
    expect(game?.currentQuestionIndex).toBe(0);
    expect(typeof game?.roundEndsAt).toBe("number");
  });

  it("schedules endAnswering for question 0", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await t.run(async (ctx) => {
      const gameId = await ctx.db.insert("games", BASE_GENERATING_GAME);
      return { gameId };
    });

    vi.useFakeTimers();

    try {
      await t.mutation(internal.gameEngine.saveQuestions, {
        gameId,
        questions: TEST_QUESTIONS,
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

describe("gameEngine.recoverFromGenerationFailure", () => {
  it("returns the game to the lobby and resets every player", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await t.run(async (ctx) => {
      const gameId = await ctx.db.insert("games", {
        code: "XXXXXX",
        status: "generating",
        quizAnimal: "dogs",
        quizModel: "openai/gpt-5.6-luna",
        quizTone: "standard",
        quizTheme: "diet-and-nutrition",
        questionCount: 2,
        timeLimitSeconds: 30,
        currentQuestionIndex: 0,
      });
      await ctx.db.insert("players", {
        gameId,
        sessionId: "session-1",
        character: "apricot",
        isReady: true,
      });
      await ctx.db.insert("players", {
        gameId,
        sessionId: "session-2",
        character: "aqua",
        isReady: true,
      });
      return { gameId };
    });

    await t.mutation(internal.gameEngine.recoverFromGenerationFailure, {
      gameId,
    });

    const game = await t.run((ctx) => ctx.db.get(gameId));
    const players = await t.run((ctx) =>
      ctx.db
        .query("players")
        .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
        .collect(),
    );

    expect(game?.status).toBe("lobby");
    expect(game?.quizGenerationFailedAt).toEqual(expect.any(Number));
    expect(players.every((player) => !player.isReady)).toBe(true);
  });
});

describe("gameEngine integration", () => {
  it("completes a two-question game end-to-end", async () => {
    const t = convexTest(schema, modules);
    const { gameId } = await t.run(async (ctx) => {
      const gameId = await ctx.db.insert("games", {
        code: "XXXXXX",
        status: "generating",
        quizAnimal: "dogs",
        quizModel: "openai/gpt-5.6-luna",
        quizTone: "standard",
        quizTheme: "diet-and-nutrition",
        questionCount: 2,
        timeLimitSeconds: 30,
        currentQuestionIndex: 0,
      });
      return { gameId };
    });

    vi.useFakeTimers();

    try {
      await t.mutation(internal.gameEngine.saveQuestions, {
        gameId,
        questions: [
          {
            text: "Q1?",
            choices: [
              { label: "A", text: "Opt A" },
              { label: "B", text: "Opt B" },
            ],
            correctLabel: "A",
          },
          {
            text: "Q2?",
            choices: [
              { label: "A", text: "Opt A" },
              { label: "B", text: "Opt B" },
            ],
            correctLabel: "B",
          },
        ],
      });

      await t.finishAllScheduledFunctions(vi.runAllTimers);

      const game = await t.run((ctx) => ctx.db.get(gameId));
      expect(game?.status).toBe("finished");
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});
