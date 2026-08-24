import { v } from "convex/values";

export const QUESTION_COUNT_OPTIONS = [5, 10, 15] as const;
export const TIME_LIMIT_SECONDS_OPTIONS = [30, 60, 90] as const;
export const RESULTS_DURATION_SECONDS = 1000;

export type QuestionCount = (typeof QUESTION_COUNT_OPTIONS)[number];
export type TimeLimitSeconds = (typeof TIME_LIMIT_SECONDS_OPTIONS)[number];

export const questionCountValidator = v.union(
  ...QUESTION_COUNT_OPTIONS.map((option) => v.literal(option)),
);

export const timeLimitSecondsValidator = v.union(
  ...TIME_LIMIT_SECONDS_OPTIONS.map((option) => v.literal(option)),
);

export function isQuestionCount(value: number): value is QuestionCount {
  return QUESTION_COUNT_OPTIONS.some((option) => option === value);
}

export function isTimeLimitSeconds(value: number): value is TimeLimitSeconds {
  return TIME_LIMIT_SECONDS_OPTIONS.some((option) => option === value);
}
