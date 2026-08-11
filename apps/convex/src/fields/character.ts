import { v } from "convex/values";

export const CHARACTER_OPTIONS = [
  {
    value: "apricot",
    label: "Apricot",
    image: "/players/apricot.webp",
  },
  {
    value: "aqua",
    label: "Aqua",
    image: "/players/aqua.webp",
  },
  {
    value: "coral",
    label: "Coral",
    image: "/players/coral.webp",
  },
  {
    value: "lavender",
    label: "Lavender",
    image: "/players/lavender.webp",
  },
  {
    value: "lemon",
    label: "Lemon",
    image: "/players/lemon.webp",
  },
  {
    value: "lime",
    label: "Lime",
    image: "/players/lime.webp",
  },
  {
    value: "mint",
    label: "Mint",
    image: "/players/mint.webp",
  },
  {
    value: "peach",
    label: "Peach",
    image: "/players/peach.webp",
  },
  {
    value: "rose",
    label: "Rose",
    image: "/players/rose.webp",
  },
  {
    value: "violet",
    label: "Violet",
    image: "/players/violet.webp",
  },
] as const;

export type Character = (typeof CHARACTER_OPTIONS)[number];
export type CharacterValue = Character["value"];

export const CHARACTER_BY_VALUE = Object.fromEntries(
  CHARACTER_OPTIONS.map((character) => [character.value, character]),
) as Record<CharacterValue, Character>;

export function getCharacterByValue(value: CharacterValue): Character {
  return CHARACTER_BY_VALUE[value];
}

export const characterValidator = v.union(
  ...CHARACTER_OPTIONS.map((option) => v.literal(option.value)),
);
