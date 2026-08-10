"use node";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { v } from "convex/values";
import { z } from "zod";

import type { QuizAnimal } from "./fields/quizAnimal";
import type { QuizTheme } from "./fields/quizTheme";
import type { QuizTone } from "./fields/quizTone";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { getQuizAnimalByValue } from "./fields/quizAnimal";
import { getQuizThemeByValue } from "./fields/quizTheme";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

const model = openrouter("google/gemini-3.6-flash", {
  plugins: [{ id: "response-healing" }],
});

export const generateQuestions = internalAction({
  args: { gameId: v.id("games") },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const gameConfig = await ctx.runQuery(internal.gameEngine.getGameConfig, { gameId: args.gameId }); // prettier-ignore

      const prompt = buildPrompt({
        questionCount: gameConfig.questionCount,
        quizAnimalValue: gameConfig.quizAnimal,
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
  quizAnimalValue: QuizAnimal;
  quizThemeValue: QuizTheme;
  quizToneValue: QuizTone;
}): string {
  const { quizAnimalValue, quizThemeValue, questionCount } = config;
  const quizAnimal = getQuizAnimalByValue(quizAnimalValue);
  const quizTheme = getQuizThemeByValue(quizThemeValue);

  return [
    `You are a pet-care trivia quiz generator.`,
    ``,
    `## Animal`,
    `- Type: ${quizAnimal.label}`,
    `- Scope: ${quizAnimal.description}`,
    ``,
    `## Care theme: ${quizTheme.label}`,
    `${quizTheme.instructions}`,
    ``,
    `## Task`,
    `Generate exactly ${questionCount} multiple-choice pet-care trivia questions about ${quizAnimal.label.toLocaleLowerCase()}.`,
    ``,
    `## Rules`,
    `- Every question must be specifically about caring for ${quizAnimal.label.toLocaleLowerCase()}.`,
    `- Every question must fall within the "${quizTheme.label}" care theme.`,
    `- Focus on practical, educational knowledge that helps people understand responsible pet care.`,
    `- Avoid self-evident questions that a person could answer from everyday common sense alone, such as why a pet needs fresh water or whether overfeeding is unhealthy. Instead, test a useful misconception, practical decision, likely consequence, meaningful comparison, or overlooked care habit.`,
    `- Before keeping a question, silently ask: "Would a responsible adult with no pet-specific knowledge find the correct answer immediately obvious?" If yes, replace it with a more informative question within the same theme.`,
    `- Base questions and correct answers only on high-confidence, broadly accepted pet-care guidance. If uncertain about a fact or answer, choose a different question rather than guessing.`,
    `- Do not diagnose illness, prescribe treatment, or imply that trivia can replace advice from a qualified veterinarian.`,
    `- When care needs vary by species, breed, age, health, or location, avoid presenting one narrow recommendation as universal.`,
    `- Do not repeat questions or ask the same question worded differently.`,
    `- Questions must be clearly and simply worded. Avoid awkward or confusing phrasing.`,
    `- Every question must end with a question mark.`,
    `- Try to keep each question under 120 characters. Prefer concise phrasing.`,
    `- Each question must have exactly 4 answer choices.`,
    `- Exactly one choice must be correct. Set correctIndex to its 0-based position (0 = first choice, 1 = second, 2 = third, 3 = fourth).`,
    `- The 3 incorrect choices must be plausible but unambiguously wrong.`,
    `- Randomize the position of the correct answer across questions — do not always place it in the same slot.`,
    `- Try to keep each answer choice under 100 characters.`,
    `- Every answer choice must end with a full stop, unless ending with a full stop would be grammatically inappropriate (e.g. a proper name or a short numeric answer).`,
  ].join("\n");
}
