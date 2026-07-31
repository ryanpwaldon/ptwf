import { v } from "convex/values";

export const QUIZ_TONE_OPTIONS = [
  {
    value: "standard",
    label: "Standard",
    description: "Straightforward and neutral quiz host.",
    posterClassName: "bg-linear-to-br from-slate-400 via-zinc-500 to-gray-700",
  },
  {
    value: "sarcastic",
    label: "Sarcastic",
    description: "Dry wit and playful jabs at wrong answers.",
    posterClassName:
      "bg-conic-[from_135deg_at_60%_40%] from-yellow-500 via-amber-700 to-yellow-500",
  },
  {
    value: "dramatic",
    label: "Dramatic",
    description:
      "Over-the-top narrator energy, every question is life or death.",
    posterClassName:
      "bg-radial-[at_50%_100%] from-red-600 via-rose-900 to-black",
  },
  {
    value: "roast",
    label: "Roast",
    description: "Lovingly roasts the questions and the player.",
    posterClassName: "bg-linear-to-t from-orange-600 via-red-500 to-yellow-400",
  },
  {
    value: "unhinged",
    label: "Unhinged",
    description: "Chaotic energy, absurd commentary, no filter.",
    posterClassName: "bg-conic from-lime-400 via-fuchsia-500 to-lime-400",
  },
  {
    value: "pet-nerd",
    label: "Pet Nerd",
    description: "Enthusiastic animal expert who always has one more fun fact.",
    posterClassName:
      "bg-radial-[at_top_right] from-stone-500 via-neutral-800 to-stone-950",
  },
  {
    value: "wholesome",
    label: "Wholesome",
    description: "Encouraging and warm, celebrates every answer.",
    posterClassName: "bg-radial from-pink-300 via-rose-400 to-amber-200",
  },
] as const;

export type QuizToneOption = (typeof QUIZ_TONE_OPTIONS)[number];
export type QuizTone = QuizToneOption["value"];

export const QUIZ_TONE_BY_VALUE = Object.fromEntries(
  QUIZ_TONE_OPTIONS.map((tone) => [tone.value, tone]),
) as Record<QuizTone, QuizToneOption>;

export function getQuizToneByValue(value: QuizTone): QuizToneOption {
  return QUIZ_TONE_BY_VALUE[value];
}

export const quizToneValidator = v.union(
  ...QUIZ_TONE_OPTIONS.map((option) => v.literal(option.value)),
);
