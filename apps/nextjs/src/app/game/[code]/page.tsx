"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  useSessionMutation,
  useSessionQuery,
} from "convex-helpers/react/sessions";
import { useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { AnimatePresence, motion } from "motion/react";

import { api } from "@acme/convex";
import { toast } from "@acme/ui/toast";

import { FullScreenError } from "~/components/full-screen-error";
import { FullScreenLoader } from "~/components/full-screen-loader";
import { GameGenerating } from "~/components/game-generating";
import { GameLobby } from "~/components/game-lobby";
import { GamePlay } from "~/components/game-play";
import { GameResults } from "~/components/game-results";
import {
  gamePlayVariants,
  gameResultsEntrance,
} from "~/components/game-transition";

export default function GamePage() {
  const { code } = useParams<{ code: string }>();
  const normalizedCode = code.trim().toUpperCase();
  const game = useQuery(api.games.byCode, { code: normalizedCode });
  const me = useSessionQuery(api.players.me, game ? { gameId: game._id } : "skip"); // prettier-ignore
  const players = useQuery(api.players.allByGameId, game ? { gameId: game._id } : "skip"); // prettier-ignore
  const questions = useQuery(api.questions.allByGameId, game ? { gameId: game._id } : "skip"); // prettier-ignore
  const answers = useQuery(api.answers.allByGameId, game ? { gameId: game._id } : "skip"); // prettier-ignore

  const joinGame = useSessionMutation(api.players.join);
  const [joinError, setJoinError] = useState<string | null>(null);
  const hasAttemptedJoin = useRef(false);
  const lastQuizGenerationFailure = useRef<number | undefined>(undefined);

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

  useEffect(() => {
    const failedAt = game?.quizGenerationFailedAt;
    if (!failedAt || lastQuizGenerationFailure.current === failedAt) return;
    lastQuizGenerationFailure.current = failedAt;
    toast.error("Quiz generation failed. Please try again.");
  }, [game?.quizGenerationFailedAt]);

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

  if (game.status === "lobby") {
    return <GameLobby game={game} players={players} me={me} />;
  }

  if (game.status === "generating") {
    return <GameGenerating />;
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      {game.status === "active" ? (
        <motion.div
          key="game-play"
          variants={gamePlayVariants}
          initial="visible"
          animate="visible"
          exit="exit"
        >
          <GamePlay
            game={game}
            me={me}
            players={players}
            questions={questions}
            answers={answers}
          />
        </motion.div>
      ) : (
        <motion.div key="game-results" {...gameResultsEntrance}>
          <GameResults
            game={game}
            me={me}
            players={players}
            questions={questions}
            answers={answers}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
