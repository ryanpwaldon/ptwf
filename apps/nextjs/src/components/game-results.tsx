import type { FunctionReturnType } from "convex/server";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionMutation } from "convex-helpers/react/sessions";
import { LoaderCircleIcon, RotateCcwIcon } from "lucide-react";

import { api, getCharacterByValue } from "@acme/convex";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";

import { Header } from "~/components/header";
import { Leaderboard } from "~/components/leaderboard";
import { QuestionResult } from "~/components/question-result";
import { PageShell } from "./page-shell";

type Me = NonNullable<FunctionReturnType<typeof api.players.me>>;
type Game = NonNullable<FunctionReturnType<typeof api.games.byCode>>;
type Player = FunctionReturnType<typeof api.players.allByGameId>[number];
type Question = FunctionReturnType<typeof api.questions.allByGameId>[number];
type Answer = FunctionReturnType<typeof api.answers.allByGameId>[number];

interface GameResultsProps {
  game: Game;
  me: Me;
  players: Player[];
  questions: Question[];
  answers: Answer[];
}

export function GameResults({
  game,
  me,
  players,
  questions,
  answers,
}: GameResultsProps) {
  const router = useRouter();
  const playAgain = useSessionMutation(api.games.playAgain);
  const [isStartingReplay, setIsStartingReplay] = useState(false);
  const sortedQuestions = useMemo(() => [...questions].sort((a, b) => a.index - b.index), [questions]); // prettier-ignore
  const replayCount = players.filter((player) => player.replayRequested).length;
  const playAgainLabel =
    players.length === 1
      ? "Play again"
      : `Play again ${replayCount}/${players.length}`;

  async function handlePlayAgain() {
    setIsStartingReplay(true);
    try {
      const code = await playAgain({ gameId: game._id });
      router.push(`/game/${code}`);
    } finally {
      setIsStartingReplay(false);
    }
  }

  const leaderboardEntries = useMemo(
    () =>
      players
        .map((player) => ({
          character: getCharacterByValue(player.character),
          correctAnswers: answers.filter(
            (a) => a.playerId === player._id && a.isCorrect,
          ).length,
        }))
        .sort((a, b) => b.correctAnswers - a.correctAnswers),
    [players, answers],
  );

  const questionResults = useMemo(() => {
    const answersByQuestion = new Map<string, Answer[]>();
    for (const a of answers) {
      const list = answersByQuestion.get(a.questionId) ?? [];
      list.push(a);
      answersByQuestion.set(a.questionId, list);
    }

    return sortedQuestions.map((question) => {
      const questionAnswers = answersByQuestion.get(question._id) ?? [];

      const choices = question.choices.map((choice) => ({
        text: choice.text,
        voters: questionAnswers
          .filter((a) => a.selectedLabel === choice.label)
          .map((a) => getCharacterByValue(a.character)),
      }));

      const correctIndex = question.choices.findIndex((ch) => ch.label === question.correctLabel); // prettier-ignore
      const myAnswer = questionAnswers.find((a) => a.playerId === me._id);
      const myChoiceIndex = myAnswer ? question.choices.findIndex((ch) => ch.label === myAnswer.selectedLabel) : -1; // prettier-ignore

      return {
        id: question._id,
        question: question.text,
        questionIndex: question.index,
        choices,
        correctIndex,
        myChoiceIndex,
      };
    });
  }, [sortedQuestions, answers, me._id]);

  return (
    <PageShell>
      <Header title="Game results" />
      <main className="flex-1 px-4 pb-16">
        <div className="mt-8 space-y-1">
          <h1 className="text-[1.75rem] leading-8 font-bold tracking-tight">
            Great game!
          </h1>
          <p className="text-muted-foreground">Here are the final results.</p>
        </div>
        <Card className="mt-6 py-0">
          <CardContent className="p-0">
            <Leaderboard
              entries={leaderboardEntries}
              totalQuestions={questions.length}
              myCharacterValue={me.character}
            />
          </CardContent>
        </Card>
        <h2 className="mt-6 text-lg font-medium">Score breakdown</h2>
        {questionResults.map((result) => (
          <QuestionResult
            key={result.id}
            className="mt-6"
            question={result.question}
            questionIndex={result.questionIndex}
            choices={result.choices}
            correctIndex={result.correctIndex}
            myChoiceIndex={result.myChoiceIndex}
          />
        ))}
      </main>
      <div className="bg-background/95 sticky bottom-0 mt-4 flex justify-end gap-4 border-t p-4 backdrop-blur">
        <Button size="xl" variant="secondary" asChild>
          <Link href="/">Return home</Link>
        </Button>
        <Button
          size="xl"
          disabled={isStartingReplay}
          className="disabled:opacity-100"
          onClick={() => void handlePlayAgain()}
        >
          {isStartingReplay ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <RotateCcwIcon />
          )}
          {playAgainLabel}
        </Button>
      </div>
    </PageShell>
  );
}
