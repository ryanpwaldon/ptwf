import { describe, expect, it } from "vitest";

import { QUIZ_THEME_OPTIONS } from "./fields/quizTheme";
import { buildPrompt, labelAt, transformQuestions } from "./quizmaster";

const FUN_FACTS_THEME = QUIZ_THEME_OPTIONS[0];

const BASE_MOVIE = {
  title: "Inception",
  overview: "A thief who steals corporate secrets through dream-sharing.",
  releaseDate: "2010-07-16",
};

const BASE_CONFIG = {
  questionCount: 5,
  quizMovie: BASE_MOVIE,
  quizThemeValue: FUN_FACTS_THEME.value,
  quizToneValue: "standard" as const,
};

describe("labelAt", () => {
  it("returns the correct letter for each valid index", () => {
    expect(labelAt(0)).toBe("A");
    expect(labelAt(1)).toBe("B");
    expect(labelAt(2)).toBe("C");
    expect(labelAt(3)).toBe("D");
  });

  it("throws for index >= 4", () => {
    expect(() => labelAt(4)).toThrow();
    expect(() => labelAt(10)).toThrow();
  });
});

describe("transformQuestions", () => {
  it("maps question fields to the expected output shape", () => {
    const input = {
      questions: [
        {
          question: "What is the name of the main character?",
          choices: ["Alice", "Bob", "Carol", "Dave"],
          correctIndex: 2 as const,
        },
      ],
    };

    const result = transformQuestions(input);

    expect(result).toEqual([
      {
        text: "What is the name of the main character?",
        choices: [
          { label: "A", text: "Alice" },
          { label: "B", text: "Bob" },
          { label: "C", text: "Carol" },
          { label: "D", text: "Dave" },
        ],
        correctLabel: "C",
      },
    ]);
  });
});

describe("buildPrompt", () => {
  it("includes movie title, release year, and plot", () => {
    const prompt = buildPrompt(BASE_CONFIG);

    expect(prompt).toContain("Inception");
    expect(prompt).toContain("2010");
    expect(prompt).toContain(
      "A thief who steals corporate secrets through dream-sharing.",
    );
  });

  it("falls back to 'Unknown' when overview is empty", () => {
    const prompt = buildPrompt({
      ...BASE_CONFIG,
      quizMovie: { ...BASE_MOVIE, overview: "" },
    });

    expect(prompt).toContain("Plot: Unknown");
  });

  it("falls back to 'Unknown' for release year when releaseDate is empty", () => {
    const prompt = buildPrompt({
      ...BASE_CONFIG,
      quizMovie: { ...BASE_MOVIE, releaseDate: "" },
    });

    expect(prompt).toContain("Release Year: Unknown");
  });

  it("includes the question count", () => {
    const prompt = buildPrompt({ ...BASE_CONFIG, questionCount: 8 });

    expect(prompt).toContain("8");
  });

  it("includes the theme label and instructions", () => {
    const prompt = buildPrompt(BASE_CONFIG);

    expect(prompt).toContain(FUN_FACTS_THEME.label);
    expect(prompt).toContain(FUN_FACTS_THEME.instructions);
  });
});
