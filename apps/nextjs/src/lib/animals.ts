export interface Animal {
  value: string;
  label: string;
  description: string;
  imagePath: string;
}

export const animals: Animal[] = [
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
];
