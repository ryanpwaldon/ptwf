import type { GenericDatabaseReader } from "convex/server";
import { ConvexError } from "convex/values";

import type { DataModel, Id } from "./_generated/dataModel";

interface PlayerLookupCtx {
  db: GenericDatabaseReader<DataModel>;
}

export function findPlayerBySession(
  ctx: PlayerLookupCtx,
  gameId: Id<"games">,
  sessionId: string,
) {
  return ctx.db
    .query("players")
    .withIndex("by_gameId_and_sessionId", (q) =>
      q.eq("gameId", gameId).eq("sessionId", sessionId),
    )
    .unique();
}

export async function requireParticipant(
  ctx: PlayerLookupCtx,
  gameId: Id<"games">,
  sessionId: string,
) {
  const player = await findPlayerBySession(ctx, gameId, sessionId);
  if (!player) throw new ConvexError("Not a participant.");
  return player;
}
