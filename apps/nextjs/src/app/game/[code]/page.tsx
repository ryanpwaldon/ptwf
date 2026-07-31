"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  useSessionMutation,
  useSessionQuery,
} from "convex-helpers/react/sessions";
import { useQuery } from "convex/react";
import { ConvexError } from "convex/values";

import { api } from "@acme/convex";

import { FullScreenError } from "~/components/full-screen-error";
import { FullScreenLoader } from "~/components/full-screen-loader";
import { GameGenerating } from "~/components/game-generating";
import { GameLobby } from "~/components/game-lobby";
import { GamePlay } from "~/components/game-play";
import { GameResults } from "~/components/game-results";

export default function GamePage() {
  const { code } = useParams<{ code: string }>();
  const game = useQuery(api.games.byCode, { code });
  const me = useSessionQuery(api.players.me, game ? { gameId: game._id } : "skip"); // prettier-ignore
  const players = useQuery(api.players.allByGameId, game ? { gameId: game._id } : "skip"); // prettier-ignore
  const questions = useQuery(api.questions.allByGameId, game ? { gameId: game._id } : "skip"); // prettier-ignore
  const answers = useQuery(api.answers.allByGameId, game ? { gameId: game._id } : "skip"); // prettier-ignore

  const joinGame = useSessionMutation(api.players.join);
  const [joinError, setJoinError] = useState<string | null>(null);
  const hasAttemptedJoin = useRef(false);

  useEffect(() => {
    if (game && me === null && !hasAttemptedJoin.current) {
      hasAttemptedJoin.current = true;
      joinGame({ code: game.code }).catch((err: unknown) => {
        const message =
          err instanceof ConvexError
            ? String(err.data)
            : "An unexpected error occurred.";
        setJoinError(message);
      });
    }
  }, [game, joinGame, me]);

  if (game === null) {
    return (
      <FullScreenError
        title="Game not found."
        description="The game you are looking for does not exist."
      />
    );
  }

  if (joinError !== null) {
    return (
      <FullScreenError title="Could not join game." description={joinError} />
    );
  }

  if (
    game === undefined ||
    players === undefined ||
    me === undefined ||
    me === null ||
    questions === undefined ||
    answers === undefined
  ) {
    return <FullScreenLoader />;
  }

  return (
    // prettier-ignore
    <>
      {game.status === "lobby" && <GameLobby game={game} players={players} me={me} />}
      {game.status === "generating" && <GameGenerating />}
      {game.status === "active" && <GamePlay game={game} me={me} players={players} questions={questions} answers={answers} />}
      {game.status === "finished" && <GameResults me={me} players={players} questions={questions} answers={answers} />}
    </>
  );
}
