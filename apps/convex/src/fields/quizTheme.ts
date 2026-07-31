import { v } from "convex/values";

export const QUIZ_THEME_OPTIONS = [
  {
    value: "fun-facts",
    label: "Fun Facts",
    posterLabel: "Fun\nFacts",
    description: "Discover surprising and lesser-known trivia about the movie.",
    instructions:
      "Questions should focus on surprising, unusual, or lesser-known trivia about the movie such as unexpected casting choices, improvised scenes, on-set stories, hidden easter eggs, production anecdotes, or interesting coincidences; avoid basic plot, cast, or obvious factual questions.",
    posterClassName: "bg-orange-600",
  },
  {
    value: "general-knowledge",
    label: "General Knowledge",
    posterLabel: "General Know-\nledge",
    description:
      "Test your overall knowledge of the movie's cast, story, and key moments.",
    instructions:
      "Questions should cover a broad range of well-known facts about the movie, including main cast, director, major plot points, characters, iconic quotes, release details, and notable awards; focus on information an average fan would reasonably know.",
    posterClassName: "bg-red-600",
  },
  {
    value: "props",
    label: "Props",
    posterLabel: "Props",
    description:
      "Uncover the hidden stories behind the movie's most memorable objects and costumes.",
    instructions:
      "Questions should focus on interesting facts and stories behind physical objects, costumes, and wardrobe featured in the movie, such as how a prop was made, where an iconic item ended up after filming, surprising details about a costume's design, real vs replica items used on set, or the history behind a memorable object; prioritize questions where the answer teaches the player something interesting.",
    posterClassName: "bg-blue-600",
  },
  {
    value: "locations",
    label: "Locations",
    posterLabel: "Loca-\ntions",
    description:
      "How well do you know where the movie takes place — and where it was filmed?",
    instructions:
      "Questions should focus on where the movie takes place and where it was filmed, including real-world filming locations, in-universe settings, iconic scene backdrops, geographic details, and recognizable landmarks; do not ask about plot, dialogue, or production unless directly tied to a specific location.",
    posterClassName: "bg-lime-600",
  },
  {
    value: "quotable",
    label: "Quotable",
    posterLabel: "Quot-\nable",
    description: "See how well you remember the movie's most famous lines.",
    instructions:
      "Questions must center on memorable lines of dialogue from the movie, including identifying who said a quote, completing a famous line, or recalling the context of a specific quote; every question must explicitly involve dialogue from the film.",
    posterClassName: "bg-indigo-600",
  },
  {
    value: "by-the-numbers",
    label: "By the Numbers",
    posterLabel: "By\nthe\nNum-\nbers",
    description:
      "Put your knowledge of the movie's stats and figures to the test.",
    instructions:
      "Questions must involve a numerical answer or numerical fact about the movie, such as box office earnings, budget, runtime, release year, number of sequels, awards count, actor ages, or records broken; every question should require the player to recall or guess a specific number or statistic.",
    posterClassName: "bg-pink-600",
  },
  {
    value: "soundtracks",
    label: "Soundtracks",
    posterLabel: "Sound-\ntracks",
    description: "Challenge yourself on the movie's music, score, and songs.",
    instructions:
      "Questions must focus exclusively on the movie's music including the composer, score, soundtrack songs, performing artists, lyrical moments, music-related awards, and memorable musical scenes; do not ask about general plot, dialogue, or visuals unless directly tied to the music.",
    posterClassName: "bg-emerald-600",
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
