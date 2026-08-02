import { v } from "convex/values";

export const QUIZ_ANIMAL_OPTIONS = [
  {
    value: "dogs",
    label: "Dogs",
    description:
      "Explore canine nutrition, grooming, training, behaviour, and everyday wellbeing.",
    imagePath: "/animals/dogs.webp",
  },
  {
    value: "cats",
    label: "Cats",
    description:
      "Test what you know about feline health, enrichment, communication, and care.",
    imagePath: "/animals/cats.webp",
  },
  {
    value: "birds",
    label: "Birds",
    description:
      "Learn about companion bird diets, habitats, behaviour, safety, and enrichment.",
    imagePath: "/animals/birds.webp",
  },
  {
    value: "fish",
    label: "Fish",
    description:
      "Dive into aquarium care, water quality, feeding, habitats, and fish wellbeing.",
    imagePath: "/animals/fish.webp",
  },
] as const;

export type QuizAnimalOption = (typeof QUIZ_ANIMAL_OPTIONS)[number];
export type QuizAnimal = QuizAnimalOption["value"];

export const QUIZ_ANIMAL_BY_VALUE = Object.fromEntries(
  QUIZ_ANIMAL_OPTIONS.map((animal) => [animal.value, animal]),
) as Record<QuizAnimal, QuizAnimalOption>;

export function isQuizAnimal(value: string): value is QuizAnimal {
  return value in QUIZ_ANIMAL_BY_VALUE;
}

export function getQuizAnimalByValue(value: QuizAnimal): QuizAnimalOption {
  return QUIZ_ANIMAL_BY_VALUE[value];
}

export const quizAnimalValidator = v.union(
  ...QUIZ_ANIMAL_OPTIONS.map((option) => v.literal(option.value)),
);
