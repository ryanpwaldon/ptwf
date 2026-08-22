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
import { getQuizModelByValue } from "./fields/quizModel";
import { getQuizThemeByValue } from "./fields/quizTheme";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

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

      const quizModel = getQuizModelByValue(gameConfig.quizModel);
      const model = openrouter(quizModel.value, {
        ...quizModel.openRouterSettings,
        plugins: [{ id: "response-healing" }],
      });
      const schema = buildQuestionSchema(gameConfig.questionCount);
      const { output } = await generateText({
        model,
        prompt,
        output: Output.object({ schema }),
        timeout: QUIZ_GENERATION_TIMEOUT_MS,
      });

      const questions = transformQuestions(output);

      await ctx.runMutation(internal.gameEngine.saveQuestions, {
        gameId: args.gameId,
        questions,
      });
    } catch (error) {
      await ctx.runMutation(internal.gameEngine.recoverFromGenerationFailure, {
        gameId: args.gameId,
      });
      throw error;
    }
  },
});

// ========================================================================================
// Helpers
// ========================================================================================

const QUIZ_GENERATION_TIMEOUT_MS = 30_000;

export function transformQuestions(
  output: z.infer<ReturnType<typeof buildQuestionSchema>>,
  random: () => number = Math.random,
): {
  text: string;
  choices: { label: string; text: string }[];
  correctLabel: string;
}[] {
  return output.questions.map((q) => {
    const answers = shuffle(
      [
        { text: q.correctAnswer, isCorrect: true },
        ...q.incorrectAnswers.map((text) => ({ text, isCorrect: false })),
      ],
      random,
    );

    return {
      text: q.question,
      choices: answers.map((answer, i) => ({
        label: labelAt(i),
        text: answer.text,
      })),
      correctLabel: labelAt(answers.findIndex((answer) => answer.isCorrect)),
    };
  });
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const item = shuffled[i];
    const swap = shuffled[j];
    if (item === undefined || swap === undefined) {
      throw new Error("Invalid shuffle index.");
    }
    shuffled[i] = swap;
    shuffled[j] = item;
  }

  return shuffled;
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
          correctAnswer: z.string(),
          incorrectAnswers: z.array(z.string()).length(3),
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
    ``,
    `## Care theme: ${quizTheme.label}`,
    `${quizTheme.promptGuidance}`,
    ``,
    `## Task`,
    `Generate exactly ${questionCount} multiple-choice pet-care trivia questions about ${quizAnimal.label.toLocaleLowerCase()}.`,
    ``,
    `## Rules`,
    `- Every question must be specifically about caring for ${quizAnimal.label.toLocaleLowerCase()} kept as pets.`,
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
    `- Provide exactly 1 correct answer and exactly 3 incorrect answers for each question.`,
    `- The 3 incorrect choices must be plausible but unambiguously wrong.`,
    `- Try to keep each answer choice under 100 characters.`,
    `- Every answer choice must end with a full stop, unless ending with a full stop would be grammatically inappropriate (e.g. a proper name or a short numeric answer).`,
    ``,
    formatBadQuestionExamples(),
  ].join("\n");
}

interface BadQuestionExample {
  question: string;
  choices: readonly [string, string, string, string];
  whyItIsBad: string;
  generalLesson: string;
}

const BAD_QUESTION_EXAMPLES = [
  {
    question:
      "Which treat is generally safest for a dog when prepared appropriately?",
    choices: [
      "Chocolate-coated biscuits.",
      "Grapes or raisins.",
      "A small piece of plain, cooked, boneless chicken.",
      "Macadamia nuts seasoned with salt.",
    ],
    whyItIsBad:
      "This question frames several toxic foods as merely “less safe” alternatives. Asking which option is “generally safest” implies that the other choices may still be acceptable in some circumstances, rather than clearly communicating that they can seriously harm a dog.",
    generalLesson:
      "Do not use mild comparative wording when the real distinction is between safe and dangerous. If an incorrect answer involves poisoning, injury, or another significant danger, the question must describe it as unsafe. Avoid wording such as “safer,” “better,” or “preferred” when it could minimise the severity of harmful pet-care practices.",
  },
] satisfies readonly BadQuestionExample[];

function formatBadQuestionExamples(): string {
  const examples = BAD_QUESTION_EXAMPLES.flatMap((example, index) => [
    `### Bad example ${index + 1}`,
    ``,
    example.question,
    ``,
    ...example.choices.map(
      (choice, choiceIndex) => `${labelAt(choiceIndex)}. ${choice}`,
    ),
    ``,
    `Why it is bad:`,
    example.whyItIsBad,
    ``,
    `General lesson:`,
    example.generalLesson,
    ``,
  ]);

  return [
    `## Examples of bad questions`,
    ``,
    `Use the following examples to understand the reasoning behind what makes a question unsuitable. Do not merely avoid or reword the specific questions shown; apply the general lessons to every question you generate.`,
    ``,
    ...examples,
  ].join("\n");
}
