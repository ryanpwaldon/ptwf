import { describe, expect, it } from "vitest";

import { QUIZ_ANIMAL_OPTIONS } from "./fields/quizAnimal";
import { QUIZ_THEME_OPTIONS } from "./fields/quizTheme";
import { buildPrompt, labelAt, transformQuestions } from "./quizmaster";

const DIET_THEME = QUIZ_THEME_OPTIONS[0];

const BASE_CONFIG = {
  questionCount: 5,
  quizAnimalValue: "dogs" as const,
  quizThemeValue: DIET_THEME.value,
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
          question: "Which activity gives a dog mental enrichment?",
          choices: ["Foraging", "Overfeeding", "Isolation", "Inactivity"],
          correctIndex: 0 as const,
        },
      ],
    };

    const result = transformQuestions(input);

    expect(result).toEqual([
      {
        text: "Which activity gives a dog mental enrichment?",
        choices: [
          { label: "A", text: "Foraging" },
          { label: "B", text: "Overfeeding" },
          { label: "C", text: "Isolation" },
          { label: "D", text: "Inactivity" },
        ],
        correctLabel: "A",
      },
    ]);
  });
});

describe("buildPrompt", () => {
  it("includes the animal label and care scope", () => {
    const prompt = buildPrompt(BASE_CONFIG);

    expect(prompt).toContain(QUIZ_ANIMAL_OPTIONS[0].label);
    expect(prompt).toContain(QUIZ_ANIMAL_OPTIONS[0].description);
  });

  it("includes the question count", () => {
    const prompt = buildPrompt({ ...BASE_CONFIG, questionCount: 8 });

    expect(prompt).toContain("8");
  });

  it("includes the theme label and instructions", () => {
    const prompt = buildPrompt(BASE_CONFIG);

    expect(prompt).toContain(DIET_THEME.label);
    expect(prompt).toContain(DIET_THEME.instructions);
  });
});
