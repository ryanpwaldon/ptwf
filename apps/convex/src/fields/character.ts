import { v } from "convex/values";

export const CHARACTER_OPTIONS = [
  {
    value: "red",
    label: "Red",
    color: "bg-red-500",
  },
  {
    value: "orange",
    label: "Orange",
    color: "bg-orange-500",
  },
  {
    value: "amber",
    label: "Amber",
    color: "bg-amber-500",
  },
  {
    value: "yellow",
    label: "Yellow",
    color: "bg-yellow-500",
  },
  {
    value: "lime",
    label: "Lime",
    color: "bg-lime-500",
  },
  {
    value: "green",
    label: "Green",
    color: "bg-green-500",
  },
  {
    value: "emerald",
    label: "Emerald",
    color: "bg-emerald-500",
  },
  {
    value: "teal",
    label: "Teal",
    color: "bg-teal-500",
  },
  {
    value: "cyan",
    label: "Cyan",
    color: "bg-cyan-500",
  },
  {
    value: "sky",
    label: "Sky",
    color: "bg-sky-500",
  },
  {
    value: "blue",
    label: "Blue",
    color: "bg-blue-500",
  },
  {
    value: "indigo",
    label: "Indigo",
    color: "bg-indigo-500",
  },
  {
    value: "violet",
    label: "Violet",
    color: "bg-violet-500",
  },
  {
    value: "purple",
    label: "Purple",
    color: "bg-purple-500",
  },
  {
    value: "fuchsia",
    label: "Fuchsia",
    color: "bg-fuchsia-500",
  },
  {
    value: "pink",
    label: "Pink",
    color: "bg-pink-500",
  },
  {
    value: "rose",
    label: "Rose",
    color: "bg-rose-500",
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
