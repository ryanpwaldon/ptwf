import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionMutation } from "convex-helpers/react/sessions";

import { api, getCharacterByValue } from "@acme/convex";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";

import type { Answer, Game, Me, Player, Question } from "~/lib/game-data";
import { Leaderboard } from "~/components/leaderboard";
import { LoadingButton } from "~/components/loading-button";
import { PageHeader } from "~/components/page-header";
import { QuestionResult } from "~/components/question-result";
import { createAnswerIndex } from "~/lib/game-data";
import { AppShell, PageContainer } from "./app-shell";
import { PageFooter } from "./page-footer";

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
  const answerIndex = useMemo(() => createAnswerIndex(answers), [answers]);
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
    } catch (error) {
      setIsStartingReplay(false);
      throw error;
    }
  }

  const leaderboardEntries = useMemo(
    () =>
      players
        .map((player) => ({
          character: getCharacterByValue(player.character),
          correctAnswers:
            answerIndex.correctCountByPlayerId.get(player._id) ?? 0,
        }))
        .sort((a, b) => b.correctAnswers - a.correctAnswers),
    [players, answerIndex],
  );

  const questionResults = useMemo(
    () =>
      sortedQuestions.map((question) => {
        const questionAnswers = answerIndex.byQuestionId.get(question._id);

        const choices = question.choices.map((choice) => ({
          text: choice.text,
          voters: (
            questionAnswers?.bySelectedLabel.get(choice.label) ?? []
          ).map((answer) => getCharacterByValue(answer.character)),
        }));

        const correctIndex = question.choices.findIndex((ch) => ch.label === question.correctLabel); // prettier-ignore
        const myAnswer = questionAnswers?.byPlayerId.get(me._id);
        const myChoiceIndex = myAnswer ? question.choices.findIndex((ch) => ch.label === myAnswer.selectedLabel) : -1; // prettier-ignore

        return {
          id: question._id,
          question: question.text,
          questionIndex: question.index,
          choices,
          correctIndex,
          myChoiceIndex,
        };
      }),
    [sortedQuestions, answerIndex, me._id],
  );

  return (
    <AppShell>
      <PageHeader title="Game results" />
      <PageContainer className="flex flex-1 flex-col">
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
      </PageContainer>
      <PageFooter contentClassName="grid grid-cols-2 sm:flex sm:justify-end">
        <Button
          className="w-full sm:w-auto"
          size="xl"
          variant="secondary"
          asChild
        >
          <Link href="/">Return home</Link>
        </Button>
        <LoadingButton
          size="xl"
          isLoading={isStartingReplay}
          preserveContentWidth
          contentClassName="tabular-nums"
          className="w-full disabled:opacity-100 sm:w-auto"
          onClick={() => void handlePlayAgain()}
        >
          {playAgainLabel}
        </LoadingButton>
      </PageFooter>
    </AppShell>
  );
}
