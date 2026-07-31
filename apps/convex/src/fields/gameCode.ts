import { ConvexError, v } from "convex/values";
import { z } from "zod";

const CODE_LENGTH = 6;
const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const gameCodeZodSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(CODE_LENGTH, `Game code must be ${CODE_LENGTH} characters.`)
  .regex(/^[A-Z0-9]+$/, "Game code must be uppercase letters and numbers.");

export function parseGameCode(input: unknown) {
  const result = gameCodeZodSchema.safeParse(input);
  if (!result.success) {
    const firstMessage = result.error.issues[0]?.message ?? "Invalid game code."; // prettier-ignore
    throw new ConvexError(firstMessage);
  }
  return result.data;
}

export function generateGameCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export const gameCodeValidator = v.string();

export type GameCode = z.infer<typeof gameCodeZodSchema>;
