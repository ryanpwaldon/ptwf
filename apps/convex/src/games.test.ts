import type { SessionId } from "convex-helpers/server/sessions";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const SESSION_ID = "session-1" as unknown as SessionId;

describe("games", () => {
  it("creates a game with dogs selected by default", async () => {
    const t = convexTest(schema, modules);

    const code = await t.mutation(api.games.create, { sessionId: SESSION_ID });
    const game = await t.query(api.games.byCode, { code });

    expect(game?.quizAnimal).toBe("dogs");
  });

  it("stores only the selected animal value", async () => {
    const t = convexTest(schema, modules);

    const code = await t.mutation(api.games.create, { sessionId: SESSION_ID });
    const game = await t.query(api.games.byCode, { code });
    if (!game) throw new Error("Game not found.");

    await t.mutation(api.games.updateQuizAnimal, {
      sessionId: SESSION_ID,
      gameId: game._id,
      quizAnimal: "cats",
    });

    const updatedGame = await t.query(api.games.byCode, { code });
    expect(updatedGame?.quizAnimal).toBe("cats");
  });
});
