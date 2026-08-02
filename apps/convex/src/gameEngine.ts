import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalMutation, internalQuery } from "./_generated/server";
import { quizAnimalValidator } from "./fields/quizAnimal";
import { quizThemeValidator } from "./fields/quizTheme";
import { quizToneValidator } from "./fields/quizTone";

export const getGameConfig = internalQuery({
  args: { gameId: v.id("games") },
  returns: v.object({
    questionCount: v.number(),
    quizAnimal: quizAnimalValidator,
    quizTheme: quizThemeValidator,
    quizTone: quizToneValidator,
  }),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found.");
    return {
      questionCount: game.questionCount,
      quizAnimal: game.quizAnimal,
      quizTheme: game.quizTheme,
      quizTone: game.quizTone,
    };
  },
});

export const saveQuestions = internalMutation({
  args: {
    gameId: v.id("games"),
    questions: v.array(
      v.object({
        text: v.string(),
        choices: v.array(v.object({ label: v.string(), text: v.string() })),
        correctLabel: v.string(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const [i, q] of args.questions.entries()) {
      await ctx.db.insert("questions", {
        gameId: args.gameId,
        index: i,
        text: q.text,
        choices: q.choices,
        correctLabel: q.correctLabel,
      });
    }
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;
    const roundEndsAt = Date.now() + game.timeLimitSeconds * 1000;
    await ctx.db.patch(args.gameId, {
      status: "active",
      phase: "answering",
      currentQuestionIndex: 0,
      roundEndsAt,
    });
    await ctx.scheduler.runAfter(
      game.timeLimitSeconds * 1000,
      internal.gameEngine.endAnswering,
      { gameId: args.gameId, expectedIndex: 0 },
    );
  },
});

export const endAnswering = internalMutation({
  args: { gameId: v.id("games"), expectedIndex: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;
    if (game.status !== "active" || game.phase !== "answering") return null;
    if (game.currentQuestionIndex !== args.expectedIndex) return null;

    // Start the results phase.
    await ctx.db.patch(args.gameId, {
      phase: "results",
      roundEndsAt: undefined,
    });

    // Advance to the next question after the results phase.
    await ctx.scheduler.runAfter(
      RESULTS_DURATION_MS,
      internal.gameEngine.advanceQuestion,
      { gameId: args.gameId, expectedIndex: args.expectedIndex },
    );
  },
});

export const advanceQuestion = internalMutation({
  args: { gameId: v.id("games"), expectedIndex: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;
    if (game.status !== "active" || game.phase !== "results") return null;
    if (game.currentQuestionIndex !== args.expectedIndex) return null;

    // Count total questions for this game.
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_gameId_and_index", (q) => q.eq("gameId", args.gameId))
      .collect();
    const isLastQuestion = args.expectedIndex >= questions.length - 1;

    if (isLastQuestion) {
      // End the game.
      await ctx.db.patch(args.gameId, {
        status: "finished",
        phase: undefined,
      });
    } else {
      // Advance to the next question answering phase.
      const nextIndex = args.expectedIndex + 1;
      const roundEndsAt = Date.now() + game.timeLimitSeconds * 1000;
      await ctx.db.patch(args.gameId, {
        phase: "answering",
        currentQuestionIndex: nextIndex,
        roundEndsAt,
      });
      await ctx.scheduler.runAfter(
        game.timeLimitSeconds * 1000,
        internal.gameEngine.endAnswering,
        { gameId: args.gameId, expectedIndex: nextIndex },
      );
    }
  },
});

export const resetStatus = internalMutation({
  args: { gameId: v.id("games") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, { status: "lobby" });
  },
});

// ========================================================================================
// Helpers
// ========================================================================================

const RESULTS_DURATION_MS = 5000;
