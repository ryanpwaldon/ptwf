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
  it("shuffles answers and tracks the correct label", () => {
    const input = {
      questions: [
        {
          question: "Which activity gives a dog mental enrichment?",
          correctAnswer: "Foraging",
          incorrectAnswers: ["Overfeeding", "Isolation", "Inactivity"],
          explanation:
            "Foraging exercises a dog's natural food-seeking instincts and provides mental stimulation.",
        },
      ],
    };

    const result = transformQuestions(input, () => 0);

    expect(result).toEqual([
      {
        text: "Which activity gives a dog mental enrichment?",
        choices: [
          { label: "A", text: "Overfeeding" },
          { label: "B", text: "Isolation" },
          { label: "C", text: "Inactivity" },
          { label: "D", text: "Foraging" },
        ],
        correctLabel: "D",
        explanation:
          "Foraging exercises a dog's natural food-seeking instincts and provides mental stimulation.",
      },
    ]);
  });
});

describe("buildPrompt", () => {
  it("includes the selected quiz configuration", () => {
    const prompt = buildPrompt({ ...BASE_CONFIG, questionCount: 8 });

    expect(prompt).toContain(`- Type: ${QUIZ_ANIMAL_OPTIONS[0].label}`);
    expect(prompt).toContain(`## Care theme: ${DIET_THEME.label}`);
    expect(prompt).toContain(DIET_THEME.promptGuidance);
    expect(prompt).toContain(
      "Generate exactly 8 multiple-choice pet-care trivia questions",
    );
  });

  it("includes the essential answer and explanation requirements", () => {
    const prompt = buildPrompt(BASE_CONFIG);

    expect(prompt).toContain(
      "Provide exactly 1 correct answer and exactly 3 incorrect answers",
    );
    expect(prompt).toContain("Prefer answer choices of 1 to 4 words");
    expect(prompt).toContain("Provide one concise explanation");
    expect(prompt).toContain("Teach something beyond merely restating");
  });
});
