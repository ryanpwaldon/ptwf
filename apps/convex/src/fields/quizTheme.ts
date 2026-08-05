import { v } from "convex/values";

export const QUIZ_THEME_OPTIONS = [
  {
    value: "diet-and-nutrition",
    label: "Diet & Nutrition",
    posterLabel: "Diet & Nutrition",
    description: "Learn what supports a balanced, species-appropriate diet.",
    instructions:
      "Questions should focus on species-appropriate food, hydration, feeding routines, portion awareness, safe treats, and foods to avoid. Prefer broadly accepted care guidance, and avoid questions that depend on a particular commercial brand.",
    posterClassName: "bg-orange-600",
  },
  {
    value: "grooming-and-bathing",
    label: "Grooming & Bathing",
    posterLabel: "Grooming & Bathing",
    description: "Brush up on coats, feathers, scales, nails, and hygiene.",
    instructions:
      "Questions should focus on safe, species-appropriate grooming and hygiene, including brushing, bathing, nail or claw care, coat, feather, skin, and scale care, and recognising when professional help is appropriate.",
    posterClassName: "bg-cyan-600",
  },
  {
    value: "health-and-wellbeing",
    label: "Health & Wellbeing",
    posterLabel: "Health & Wellbeing",
    description: "Spot the foundations of preventive care and wellbeing.",
    instructions:
      "Questions should focus on preventive care, healthy routines, common signs that an animal may need veterinary attention, exercise, rest, and general wellbeing. Keep the content educational rather than diagnostic, and never suggest delaying professional care.",
    posterClassName: "bg-rose-600",
  },
  {
    value: "behaviour-and-communication",
    label: "Behaviour & Communication",
    posterLabel: "Behaviour & Comms",
    description: "Read the signals pets use to express comfort and concern.",
    instructions:
      "Questions should focus on species-typical body language, vocalisations, social needs, stress signals, play, rest, and humane ways people can respond to animal behaviour.",
    posterClassName: "bg-violet-600",
  },
  {
    value: "training-and-enrichment",
    label: "Training & Enrichment",
    posterLabel: "Training & Enrichment",
    description: "Keep clever minds active with humane learning and play.",
    instructions:
      "Questions should focus on reward-based training, mental stimulation, play, foraging, exercise, environmental variety, and age-appropriate enrichment. Avoid punishment-based or aversive methods.",
    posterClassName: "bg-lime-600",
  },
  {
    value: "homes-and-habitats",
    label: "Homes & Habitats",
    posterLabel: "Homes & Habitats",
    description: "Build a comfortable environment around each animal's needs.",
    instructions:
      "Questions should focus on safe housing, temperature, lighting, bedding or substrate, water quality, space, shelter, perches, and other features of a species-appropriate home.",
    posterClassName: "bg-blue-600",
  },
  {
    value: "safety-and-first-aid",
    label: "Safety & First Aid",
    posterLabel: "Safety & First Aid",
    description: "Prevent everyday hazards and know when to seek urgent help.",
    instructions:
      "Questions should focus on preventing household and environmental hazards, safe transport and handling, emergency preparedness, and recognising situations that require prompt veterinary care. Do not ask players to perform invasive treatment or replace professional advice.",
    posterClassName: "bg-red-600",
  },
] as const;

export type QuizThemeOption = (typeof QUIZ_THEME_OPTIONS)[number];
export type QuizTheme = QuizThemeOption["value"];

export const QUIZ_THEME_BY_VALUE = Object.fromEntries(
  QUIZ_THEME_OPTIONS.map((theme) => [theme.value, theme]),
) as Record<QuizTheme, QuizThemeOption>;

export function isQuizTheme(value: string): value is QuizTheme {
  return value in QUIZ_THEME_BY_VALUE;
}

export function getQuizThemeByValue(value: QuizTheme): QuizThemeOption {
  return QUIZ_THEME_BY_VALUE[value];
}

export const quizThemeValidator = v.union(
  ...QUIZ_THEME_OPTIONS.map((option) => v.literal(option.value)),
);
