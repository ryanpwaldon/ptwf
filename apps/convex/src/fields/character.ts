import { v } from "convex/values";

export const CHARACTER_OPTIONS = [
  {
    value: "apricot",
    label: "Apricot",
    image: "/players/apricot.png",
  },
  {
    value: "aqua",
    label: "Aqua",
    image: "/players/aqua.png",
  },
  {
    value: "coral",
    label: "Coral",
    image: "/players/coral.png",
  },
  {
    value: "lavender",
    label: "Lavender",
    image: "/players/lavender.png",
  },
  {
    value: "lemon",
    label: "Lemon",
    image: "/players/lemon.png",
  },
  {
    value: "lime",
    label: "Lime",
    image: "/players/lime.png",
  },
  {
    value: "mint",
    label: "Mint",
    image: "/players/mint.png",
  },
  {
    value: "peach",
    label: "Peach",
    image: "/players/peach.png",
  },
  {
    value: "rose",
    label: "Rose",
    image: "/players/rose.png",
  },
  {
    value: "violet",
    label: "Violet",
    image: "/players/violet.png",
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
