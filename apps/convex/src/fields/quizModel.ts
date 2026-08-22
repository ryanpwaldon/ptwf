import type { OpenRouterChatSettings } from "@openrouter/ai-sdk-provider";
import { v } from "convex/values";

function defineOpenRouterSettings(settings: OpenRouterChatSettings) {
  return settings;
}

export const QUIZ_MODEL_OPTIONS = [
  {
    value: "google/gemini-3.7-flash",
    label: "Gemini 3.7 Flash",
    provider: "Google",
    iconPath: "/models/google.svg",
    openRouterSettings: defineOpenRouterSettings({
      reasoning: { enabled: true, effort: "low" },
      provider: {
        ignore: ["phala"],
        require_parameters: true,
      },
    }),
  },
  {
    value: "google/gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    provider: "Google",
    iconPath: "/models/google.svg",
    openRouterSettings: defineOpenRouterSettings({
      reasoning: { enabled: false, effort: "none" },
      provider: {
        ignore: ["phala"],
        require_parameters: true,
      },
    }),
  },
  {
    value: "openai/gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    provider: "OpenAI",
    iconPath: "/models/openai.svg",
    openRouterSettings: defineOpenRouterSettings({
      reasoning: { enabled: false, effort: "none" },
      provider: {
        ignore: ["phala"],
        require_parameters: true,
      },
    }),
  },
  {
    value: "anthropic/claude-sonnet-5",
    label: "Claude Sonnet 5",
    provider: "Anthropic",
    iconPath: "/models/anthropic.svg",
    openRouterSettings: defineOpenRouterSettings({
      reasoning: { enabled: false, effort: "none" },
      provider: {
        ignore: ["phala"],
        require_parameters: true,
      },
    }),
  },
  {
    value: "deepseek/deepseek-v4-pro-0813",
    label: "DeepSeek V4 Pro 0813",
    provider: "DeepSeek",
    iconPath: "/models/deepseek.svg",
    openRouterSettings: defineOpenRouterSettings({
      reasoning: { enabled: false, effort: "none" },
      provider: {
        ignore: ["phala"],
        require_parameters: true,
      },
    }),
  },
  {
    value: "moonshotai/kimi-k2.6",
    label: "Kimi K2.6",
    provider: "Moonshot AI",
    iconPath: "/models/moonshot.svg",
    openRouterSettings: defineOpenRouterSettings({
      reasoning: { enabled: false, effort: "none" },
      provider: {
        ignore: ["phala"],
        require_parameters: true,
      },
    }),
  },
] as const;

export type QuizModelOption = (typeof QUIZ_MODEL_OPTIONS)[number];
export type QuizModel = QuizModelOption["value"];

export const QUIZ_MODEL_BY_VALUE = Object.fromEntries(
  QUIZ_MODEL_OPTIONS.map((model) => [model.value, model]),
) as Record<QuizModel, QuizModelOption>;

export function isQuizModel(value: string): value is QuizModel {
  return value in QUIZ_MODEL_BY_VALUE;
}

export function getQuizModelByValue(value: QuizModel): QuizModelOption {
  return QUIZ_MODEL_BY_VALUE[value];
}

export const quizModelValidator = v.union(
  ...QUIZ_MODEL_OPTIONS.map((option) => v.literal(option.value)),
);
