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

const QUIZ_GENERATION_TIMEOUT_MS = 60_000;

export function transformQuestions(
  output: z.infer<ReturnType<typeof buildQuestionSchema>>,
  random: () => number = Math.random,
): {
  text: string;
  choices: { label: string; text: string }[];
  correctLabel: string;
  explanation: string;
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
      explanation: q.explanation,
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
          explanation: z.string(),
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
    `## Content requirements`,
    `- Every question must be specifically about caring for ${quizAnimal.label.toLocaleLowerCase()} kept as pets.`,
    `- Every question must fall within the "${quizTheme.label}" care theme.`,
    `- Focus on practical, educational knowledge that helps people understand responsible pet care.`,
    `- Avoid self-evident questions that a person could answer from everyday common sense alone, such as why a pet needs fresh water or whether overfeeding is unhealthy. Instead, test a useful misconception, practical decision, likely consequence, meaningful comparison, or overlooked care habit.`,
    `- Base questions and correct answers only on high-confidence, broadly accepted pet-care guidance. If uncertain about a fact or answer, choose a different question rather than guessing.`,
    `- Do not diagnose illness, prescribe treatment, or imply that trivia can replace advice from a qualified veterinarian.`,
    `- When care needs vary by species, breed, age, health, or location, avoid presenting one narrow recommendation as universal.`,
    `- Do not repeat questions or ask the same question worded differently.`,
    ``,
    `## Questions`,
    `- Questions must be clearly and simply worded. Avoid awkward or confusing phrasing.`,
    `- Every question must end with a question mark.`,
    `- Try to keep each question under 120 characters. Prefer concise phrasing.`,
    `- Put the necessary context in the question so the answer choices can remain concise.`,
    `- Favor questions that naturally support short, easy-to-scan answer choices.`,
    ``,
    `## Answer choices`,
    `- Provide exactly 1 correct answer and exactly 3 incorrect answers for each question.`,
    `- The 3 incorrect choices must be plausible but unambiguously wrong.`,
    `- Prefer answer choices of 1 to 4 words. Keep them short and easy to scan. Use a longer choice only when necessary for accuracy or clarity.`,
    `- Avoid questions that require four long, sentence-like answer choices. Choose a more concise question instead.`,
    `- Keep all four choices grammatically parallel and at a similar level of specificity. Do not make the correct answer conspicuous through its length or detail.`,
    `- Answer choices should contain only the answer, not supporting reasoning or educational detail.`,
    `- Use natural punctuation. Do not add full stops to short words or sentence fragments.`,
    ``,
    `## Explanations`,
    `- Provide one concise explanation for every question.`,
    `- Teach something beyond merely restating the correct answer. Explain why it is correct, how it works, why it matters, or the practical lesson a pet owner should remember.`,
    `- Aim for 1 or 2 short sentences and roughly 15 to 40 words.`,
    `- The explanation may name the correct answer, but it must make sense as a standalone educational note.`,
    `- Do not refer to answer labels such as "A" or "choice B", because the choices will be shuffled.`,
    `- Keep explanations factual and clear. Do not add jokes, quiz-host commentary, or remarks about the player.`,
    ``,
    `## Final check`,
    `Before returning the questions, verify that each one is useful rather than obvious, has one high-confidence correct answer, has four concise and parallel choices, and includes an explanation that adds meaningful knowledge.`,
    ``,
    formatGoodQuestionExamples(),
    ``,
    formatRejectedQuestionExamples(),
  ].join("\n");
}

interface GoodQuestionExample {
  question: string;
  correctAnswer: string;
  incorrectAnswers: readonly [string, string, string];
  explanation: string;
  whyItIsGood: string;
}

const GOOD_QUESTION_EXAMPLES = [
  {
    question: "Which artificial sweetener is highly toxic to dogs?",
    correctAnswer: "Xylitol",
    incorrectAnswers: ["Stevia", "Saccharin", "Aspartame"],
    explanation:
      "Xylitol can trigger a rapid insulin release in dogs, causing dangerously low blood sugar. Larger amounts may also cause liver failure.",
    whyItIsGood:
      "The question carries the context, all four choices are concise and parallel, and the explanation adds useful information that does not belong in the answer choice.",
  },
] satisfies readonly GoodQuestionExample[];

function formatGoodQuestionExamples(): string {
  const examples = GOOD_QUESTION_EXAMPLES.flatMap((example, index) => [
    `### Good example ${index + 1}`,
    ``,
    `Question: ${example.question}`,
    `Correct answer: ${example.correctAnswer}`,
    `Incorrect answers: ${example.incorrectAnswers.join(", ")}`,
    `Explanation: ${example.explanation}`,
    ``,
    `Why it is good:`,
    example.whyItIsGood,
    ``,
  ]);

  return [
    `## Examples of good questions`,
    ``,
    `These examples demonstrate the desired structure and writing style only. Do not copy or reword their subject matter. Always generate questions for the animal and care theme specified above.`,
    ``,
    ...examples,
  ].join("\n");
}

interface RejectedQuestionExample {
  question: string;
  claimedCorrectAnswer: string;
  claimedIncorrectAnswers: readonly [string, string, string];
  problem: string;
}

const REJECTED_QUESTION_EXAMPLES = [
  {
    question:
      "Which treat is generally safest for a dog when prepared appropriately?",
    claimedCorrectAnswer: "Plain cooked chicken",
    claimedIncorrectAnswers: [
      "Chocolate biscuits",
      "Grapes or raisins",
      "Salted macadamia nuts",
    ],
    problem:
      "The comparative wording frames several toxic foods as merely less safe alternatives and may imply that they are acceptable in some circumstances. When the real distinction is between safe and dangerous, the question must communicate that clearly.",
  },
  {
    question:
      "Why should outdoor dog kennels have raised flooring above bare concrete?",
    claimedCorrectAnswer: "Prevents pressure sores",
    claimedIncorrectAnswers: [
      "Deters flying insects",
      "Increases air humidity",
      "Improves water drainage",
    ],
    problem:
      "The claimed correct answer does not follow clearly from raised flooring, and “Improves water drainage” is also reasonably defensible. The question therefore does not have a single unambiguous answer.",
  },
] satisfies readonly RejectedQuestionExample[];

function formatRejectedQuestionExamples(): string {
  const examples = REJECTED_QUESTION_EXAMPLES.flatMap((example, index) => [
    `### Rejected question ${index + 1}`,
    ``,
    `Question: ${example.question}`,
    `Claimed correct answer: ${example.claimedCorrectAnswer}`,
    `Answers marked incorrect:`,
    ...example.claimedIncorrectAnswers.map((answer) => `- ${answer}`),
    ``,
    `Why it fails:`,
    example.problem,
    ``,
  ]);

  return [
    `## Rejected questions`,
    ``,
    `These examples show questions that must not be returned. Study why each question fails, then avoid the same failure pattern. Do not copy or reword the examples.`,
    ``,
    ...examples,
  ].join("\n");
}
