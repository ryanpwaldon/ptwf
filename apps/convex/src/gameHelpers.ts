import { ConvexError } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import type { CharacterValue } from "./fields/character";
import { CHARACTER_OPTIONS } from "./fields/character";
import { generateGameCode } from "./fields/gameCode";

type GameSettings = Pick<
  Doc<"games">,
  "quizAnimal" | "quizTone" | "quizTheme" | "questionCount" | "timeLimitSeconds"
>;

interface CreateGameOptions {
  settings?: GameSettings;
  preferredCharacter?: CharacterValue;
}

export async function createGameWithPlayer(
  ctx: MutationCtx,
  sessionId: string,
  options: CreateGameOptions = {},
) {
  let code: string;
  let existing;
  do {
    code = generateGameCode();
    existing = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
  } while (existing !== null);

  const gameId = await ctx.db.insert("games", {
    code,
    status: "lobby",
    quizAnimal: options.settings?.quizAnimal ?? "dogs",
    quizTone: options.settings?.quizTone ?? "standard",
    quizTheme: options.settings?.quizTheme ?? "diet-and-nutrition",
    questionCount: options.settings?.questionCount ?? 10,
    timeLimitSeconds: options.settings?.timeLimitSeconds ?? 60,
    roundEndsAt: undefined,
    currentQuestionIndex: 0,
  });

  await addPlayerToLobby(ctx, gameId, sessionId, options.preferredCharacter);
  return { gameId, code };
}

export async function addPlayerToLobby(
  ctx: MutationCtx,
  gameId: Id<"games">,
  sessionId: string,
  preferredCharacter?: CharacterValue,
) {
  const game = await ctx.db.get(gameId);
  if (!game) throw new ConvexError("Game not found.");
  if (game.status !== "lobby") throw new ConvexError("Game is not in lobby.");

  const existing = await ctx.db
    .query("players")
    .withIndex("by_gameId_and_sessionId", (q) =>
      q.eq("gameId", gameId).eq("sessionId", sessionId),
    )
    .unique();
  if (existing) return existing._id;

  const players = await ctx.db
    .query("players")
    .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
    .collect();
  const takenCharacters = new Set(players.map((player) => player.character));
  const availableCharacters = CHARACTER_OPTIONS.filter(
    (character) => !takenCharacters.has(character.value),
  );
  const preferredCharacterOption = availableCharacters.find(
    (character) => character.value === preferredCharacter,
  );
  const character =
    preferredCharacterOption ??
    availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
  if (!character) throw new ConvexError("Game is full.");

  return ctx.db.insert("players", {
    gameId,
    sessionId,
    character: character.value,
    isReady: false,
  });
}
