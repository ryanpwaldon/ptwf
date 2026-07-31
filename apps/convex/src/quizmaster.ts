"use node";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { v } from "convex/values";
import { z } from "zod";

import type { QuizTheme } from "./fields/quizTheme";
import type { QuizTone } from "./fields/quizTone";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { getQuizThemeByValue } from "./fields/quizTheme";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

const model = openrouter("google/gemini-3-flash-preview", {
  plugins: [{ id: "response-healing" }, { id: "web" }],
});

export const generateQuestions = internalAction({
  args: { gameId: v.id("games") },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const gameConfig = await ctx.runQuery(internal.gameEngine.getGameConfig, { gameId: args.gameId }); // prettier-ignore

      const prompt = buildPrompt({
        questionCount: gameConfig.questionCount,
        quizMovie: gameConfig.quizMovie,
        quizThemeValue: gameConfig.quizTheme,
        quizToneValue: gameConfig.quizTone,
      });

      const schema = buildQuestionSchema(gameConfig.questionCount);
      const { output } = await generateText({
        model,
        prompt,
        output: Output.object({ schema }),
      });

      const questions = transformQuestions(output);

      await ctx.runMutation(internal.gameEngine.saveQuestions, {
        gameId: args.gameId,
        questions,
      });
    } catch (error) {
      await ctx.runMutation(internal.gameEngine.resetStatus, {
        gameId: args.gameId,
      });
      throw error;
    }
  },
});

// ========================================================================================
// Helpers
// ========================================================================================

export function transformQuestions(
  output: z.infer<ReturnType<typeof buildQuestionSchema>>,
): {
  text: string;
  choices: { label: string; text: string }[];
  correctLabel: string;
}[] {
  return output.questions.map((q) => ({
    text: q.question,
    choices: q.choices.map((answer, i) => ({
      label: labelAt(i),
      text: answer,
    })),
    correctLabel: labelAt(q.correctIndex),
  }));
}

export function labelAt(i: number): "A" | "B" | "C" | "D" {
  const labels = ["A", "B", "C", "D"] as const;
  const label = labels[i];
  if (label === undefined) throw new Error(`invalid label index: ${i}`);
  return label;
}

function buildQuestionSchema(questionCount: number) {
  return z.object({
    questions: z
      .array(
        z.object({
          question: z.string(),
          choices: z.array(z.string()).length(4),
          correctIndex: z.union([
            z.literal(0),
            z.literal(1),
            z.literal(2),
            z.literal(3),
          ]),
        }),
      )
      .length(questionCount),
  });
}

export function buildPrompt(config: {
  questionCount: number;
  quizMovie: {
    title: string;
    overview: string;
    releaseDate: string;
  };
  quizThemeValue: QuizTheme;
  quizToneValue: QuizTone;
}): string {
  const { quizMovie, quizThemeValue, questionCount } = config;
  const movieTitle = quizMovie.title;
  const rawYear = quizMovie.releaseDate.split("-")[0];
  const movieReleaseYear =
    rawYear !== undefined && rawYear !== "" ? rawYear : "Unknown";
  const moviePlot = quizMovie.overview || "Unknown";
  const quizTheme = getQuizThemeByValue(quizThemeValue);

  return [
    `You are a movie trivia quiz generator.`,
    ``,
    `## Movie`,
    `- Title: ${movieTitle}`,
    `- Release Year: ${movieReleaseYear}`,
    `- Plot: ${moviePlot}`,
    ``,
    `## Category: ${quizTheme.label}`,
    `${quizTheme.instructions}`,
    ``,
    `## Task`,
    `Generate exactly ${questionCount} multiple-choice trivia questions about the movie above.`,
    ``,
    `## Rules`,
    `- Every question must be specifically about "${movieTitle}" (${movieReleaseYear}).`,
    `- Every question must fall within the "${quizTheme.label}" category.`,
    `- Do not mention the movie title by name in any question. Phrase questions so they assume the reader already knows which movie is being discussed.`,
    `- Do not reference the plot summary provided above in your questions.`,
    `- Do not reference any source in a question (e.g. do not write "according to IMDb Trivia" or similar).`,
    `- Do not repeat questions or ask the same question worded differently.`,
    `- Write every question in your own words. Do not copy questions verbatim from any source. Questions must be clearly and simply worded — avoid awkward or confusing phrasing.`,
    `- Every question and every answer choice must be factually accurate and verifiable. Do not fabricate or guess any facts.`,
    `- Every question must end with a question mark.`,
    `- Never use single quotation marks in question text or answer choices. Always use double quotation marks for any inline quote, term, or emphasis (e.g. "slider", "real world"). Within JSON strings, escape them as \\".`,
    `- Try to keep each question under 120 characters. Prefer concise phrasing.`,
    `- Each question must have exactly 4 answer choices.`,
    `- Exactly one choice must be correct. Set correctIndex to its 0-based position (0 = first choice, 1 = second, 2 = third, 3 = fourth).`,
    `- The 3 incorrect choices must be plausible but unambiguously wrong.`,
    `- Randomize the position of the correct answer across questions — do not always place it in the same slot.`,
    `- Try to keep each answer choice under 100 characters.`,
    `- Every answer choice must end with a full stop, unless ending with a full stop would be grammatically inappropriate (e.g. a proper name or a short numeric answer).`,
  ].join("\n");
}
