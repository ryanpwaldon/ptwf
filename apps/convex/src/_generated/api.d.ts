/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as answers from "../answers.js";
import type * as fields_character from "../fields/character.js";
import type * as fields_gameCode from "../fields/gameCode.js";
import type * as fields_gameSettings from "../fields/gameSettings.js";
import type * as fields_quizAnimal from "../fields/quizAnimal.js";
import type * as fields_quizModel from "../fields/quizModel.js";
import type * as fields_quizTheme from "../fields/quizTheme.js";
import type * as fields_quizTone from "../fields/quizTone.js";
import type * as gameEngine from "../gameEngine.js";
import type * as gameHelpers from "../gameHelpers.js";
import type * as games from "../games.js";
import type * as migrations from "../migrations.js";
import type * as playerHelpers from "../playerHelpers.js";
import type * as players from "../players.js";
import type * as questions from "../questions.js";
import type * as quizmaster from "../quizmaster.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  answers: typeof answers;
  "fields/character": typeof fields_character;
  "fields/gameCode": typeof fields_gameCode;
  "fields/gameSettings": typeof fields_gameSettings;
  "fields/quizAnimal": typeof fields_quizAnimal;
  "fields/quizModel": typeof fields_quizModel;
  "fields/quizTheme": typeof fields_quizTheme;
  "fields/quizTone": typeof fields_quizTone;
  gameEngine: typeof gameEngine;
  gameHelpers: typeof gameHelpers;
  games: typeof games;
  migrations: typeof migrations;
  playerHelpers: typeof playerHelpers;
  players: typeof players;
  questions: typeof questions;
  quizmaster: typeof quizmaster;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  migrations: {
    lib: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { name: string },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
      cancelAll: FunctionReference<
        "mutation",
        "internal",
        { sinceTs?: number },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { limit?: number; names?: Array<string> },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      migrate: FunctionReference<
        "mutation",
        "internal",
        {
          batchSize?: number;
          cursor?: string | null;
          dryRun: boolean;
          fnHandle: string;
          name: string;
          next?: Array<{ fnHandle: string; name: string }>;
          oneBatchOnly?: boolean;
        },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
    };
  };
};
