"use client";

import type { FunctionReturnType } from "convex/server";
import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { useSessionMutation } from "convex-helpers/react/sessions";
import { CheckIcon, CircleSmallIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { api, CHARACTER_OPTIONS } from "@acme/convex";
import { cn } from "@acme/ui";
import { AvatarBadge } from "@acme/ui/avatar";
import { RadioGroup } from "@acme/ui/radio-group";

import { AnswerChoice } from "~/components/answer-choice";
import {
  gameHeaderVariants,
  questionContentVariants,
  questionExit,
} from "~/components/game-transition";
import { PlayerAvatarGroup } from "~/components/player-avatar-group";
import { QuestionStatusTrack } from "~/components/question-status-track";
import { TimeRemainingBar } from "~/components/time-remaining-bar";
import { AppShell, PageContainer } from "./app-shell";

type Game = NonNullable<FunctionReturnType<typeof api.games.byCode>>;
type Me = NonNullable<FunctionReturnType<typeof api.players.me>>;
type Question = FunctionReturnType<typeof api.questions.allByGameId>[number];
type Player = FunctionReturnType<typeof api.players.allByGameId>[number];
type Answer = FunctionReturnType<typeof api.answers.allByGameId>[number];

interface GamePlayProps {
  game: Game;
  me: Me;
  players: Player[];
  questions: Question[];
  answers: Answer[];
}

export function GamePlay({
  game,
  me,
  players,
  questions,
  answers,
}: GamePlayProps) {
  const submitAnswer = useSessionMutation(api.answers.submit);
  const phase = game.phase;
  if (!phase) return null;

  // Derive current question.
  const currentQuestion = questions.find(
    (q) => q.index === game.currentQuestionIndex,
  );
  if (!currentQuestion) return null;

  // Derive my answer for the current question.
  const myAnswerDoc = answers.find(
    (a) => a.questionId === currentQuestion._id && a.playerId === me._id,
  );

  // Build answer summary per choice.
  const currentAnswers = answers.filter(
    (a) => a.questionId === currentQuestion._id,
  );

  // Build answer summary per choice.
  const answerSummary = currentQuestion.choices.map((choice) => {
    const choiceAnswers = currentAnswers.filter((a) => a.selectedLabel === choice.label); // prettier-ignore
    const voters = choiceAnswers.map((a) => CHARACTER_OPTIONS.find((c) => c.value === a.character) ?? null).filter((c) => c !== null); // prettier-ignore
    return {
      label: choice.label,
      text: choice.text,
      count: choiceAnswers.length,
      isCorrect: choice.label === currentQuestion.correctLabel,
      voters: phase === "results" ? voters : [],
    };
  });

  // Build question results for the status track.
  const questionResults = questions.map((q) => {
    if (q.index > game.currentQuestionIndex) return "incomplete" as const;
    if (q.index === game.currentQuestionIndex && phase !== "results") return "incomplete" as const; // prettier-ignore
    // For past questions and current during results, check player's answer.
    const ans = answers.find((a) => a.questionId === q._id && a.playerId === me._id); // prettier-ignore
    if (!ans) return "skipped" as const;
    return ans.isCorrect ? ("correct" as const) : ("incorrect" as const);
  });

  // Map each character to whether their answer is correct (presence means they answered).
  const answerCorrectness = new Map(
    currentAnswers.map((a) => [a.character, a.isCorrect]),
  );

  // Map player character values to full CHARACTER_OPTIONS objects.
  const playerCharacters = players
    .map((p) => CHARACTER_OPTIONS.find((c) => c.value === p.character))
    .filter((c) => c != null);

  return (
    <GamePlayInner
      game={game}
      phase={phase}
      currentQuestion={currentQuestion}
      myAnswer={myAnswerDoc?.selectedLabel ?? null}
      answerSummary={answerSummary}
      questionResults={questionResults}
      questionCount={questions.length}
      playerCharacters={playerCharacters}
      answerCorrectness={answerCorrectness}
      submitAnswer={(label: string) => submitAnswer({ gameId: game._id, selectedLabel: label })} // prettier-ignore
    />
  );
}

// Inner component so hooks aren't called after early returns.
function GamePlayInner({
  game,
  phase,
  currentQuestion,
  myAnswer,
  answerSummary,
  questionResults,
  questionCount,
  playerCharacters,
  answerCorrectness,
  submitAnswer,
}: {
  game: Game;
  phase: "answering" | "results";
  currentQuestion: Question;
  myAnswer: string | null;
  answerSummary: {
    label: string;
    text: string;
    count: number;
    isCorrect: boolean;
    voters: (typeof CHARACTER_OPTIONS)[number][];
  }[];
  questionResults: ("correct" | "incorrect" | "skipped" | "incomplete")[];
  questionCount: number;
  playerCharacters: (typeof CHARACTER_OPTIONS)[number][];
  answerCorrectness: Map<string, boolean>;
  submitAnswer: (label: string) => void;
}) {
  // Track the local pick with the question index it belongs to. When the
  // question advances, the index won't match and we fall through to the
  // server answer, eliminating the need for effects to reset/sync state.
  const [localPick, setLocalPick] = useState<{ index: number; label: string } | null>(null); // prettier-ignore
  const selectedLabel = localPick !== null && localPick.index === game.currentQuestionIndex && phase === "answering" ? localPick.label : (myAnswer ?? null); // prettier-ignore
  const timeRemaining = useCountdown(game.roundEndsAt, phase === "answering");
  const secondsLeft = phase === "answering" ? Math.ceil(timeRemaining / 1000) : 0; // prettier-ignore
  const showResults = phase === "results";
  const isAnswering = phase === "answering";

  const handleSelect = (label: string) => {
    if (phase !== "answering") return;
    setLocalPick({ index: game.currentQuestionIndex, label });
    void submitAnswer(label);
  };

  return (
    <AppShell>
      <PageContainer className="flex flex-1 flex-col">
        <motion.header
          variants={gameHeaderVariants}
          className="flex h-16 items-center justify-between"
        >
          <div className="flex h-full w-20 items-center justify-center">
            <div className="bg-secondary text-muted-foreground flex size-7 items-center justify-center rounded-md text-center text-sm font-medium">
              Q{game.currentQuestionIndex + 1}
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <QuestionStatusTrack
              className="w-full"
              steps={questionResults}
              activeIndex={game.currentQuestionIndex}
            />
            <motion.div
              className="w-full"
              key={game.currentQuestionIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <TimeRemainingBar
                phase={phase}
                durationSeconds={game.timeLimitSeconds}
              />
            </motion.div>
          </div>
          <div className="flex h-full w-20 items-center justify-center">
            <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-center text-sm font-medium">
              <NumberFlow value={secondsLeft} />
            </div>
          </div>
        </motion.header>
        <motion.main
          variants={questionContentVariants}
          className="flex-1 px-4 pb-16"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={game.currentQuestionIndex}
              variants={questionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                variants={itemVariants}
                className="mt-8 flex justify-center"
              >
                <PlayerAvatarGroup
                  maxVisible={10}
                  avatarSize="md"
                  characters={playerCharacters}
                  renderBadge={(character) => {
                    if (!answerCorrectness.has(character.value)) return null;
                    if (phase === "answering") {
                      return (
                        <AvatarBadge
                          position="top-left"
                          className="bg-background border-primary/20 size-3! border"
                        >
                          <CircleSmallIcon className="fill-primary" />
                        </AvatarBadge>
                      );
                    }
                    const isCorrect = answerCorrectness.get(character.value);
                    return (
                      <AvatarBadge
                        position="top-left"
                        className={cn(
                          "size-3!",
                          isCorrect ? "bg-correct" : "bg-incorrect",
                        )}
                      >
                        {isCorrect ? (
                          <CheckIcon className="stroke-black stroke-5" />
                        ) : (
                          <XIcon className="stroke-black stroke-5" />
                        )}
                      </AvatarBadge>
                    );
                  }}
                />
              </motion.div>
              <motion.h2
                variants={itemVariants}
                className="text-muted-foreground mt-3 text-center text-sm font-medium"
              >
                Question {game.currentQuestionIndex + 1} of {questionCount}
              </motion.h2>
              <motion.h1
                variants={itemVariants}
                className="mt-1 text-center text-2xl leading-8 font-bold tracking-tight"
              >
                {currentQuestion.text}
              </motion.h1>
              <div className="mt-8">
                <RadioGroup
                  value={selectedLabel ?? ""}
                  onValueChange={isAnswering ? handleSelect : undefined}
                >
                  {answerSummary.map((choice) => (
                    <motion.div key={choice.label} variants={itemVariants}>
                      <AnswerChoice
                        id={`choice-${choice.label.toLowerCase()}`}
                        value={choice.label}
                        description={choice.text}
                        disabled={!isAnswering}
                        showResults={showResults}
                        isCorrectAnswer={choice.isCorrect}
                        voters={choice.voters}
                      />
                    </motion.div>
                  ))}
                </RadioGroup>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.main>
      </PageContainer>
    </AppShell>
  );
}

// ========================================================================================
// Helpers
// ========================================================================================

const questionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  exit: questionExit,
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function useCountdown(roundEndsAt: number | undefined, active: boolean) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!active || !roundEndsAt) return;
    const endTime = roundEndsAt;
    function tick() {
      setTimeRemaining(Math.max(0, endTime - Date.now()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [roundEndsAt, active]);

  return active ? timeRemaining : 0;
}
