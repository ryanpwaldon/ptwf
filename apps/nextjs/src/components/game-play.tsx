"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import NumberFlow from "@number-flow/react";
import { useSessionMutation } from "convex-helpers/react/sessions";
import { CheckIcon, CircleSmallIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { Character } from "@acme/convex";
import { api, getCharacterByValue } from "@acme/convex";
import { cn } from "@acme/ui";
import { AvatarBadge } from "@acme/ui/avatar";
import { RadioGroup } from "@acme/ui/radio-group";
import { useTheme } from "@acme/ui/theme";
import { toast } from "@acme/ui/toast";

import type { Answer, Game, Me, Player, Question } from "~/lib/game-data";
import { AnswerChoice } from "~/components/answer-choice";
import { CardFooter } from "~/components/card-footer";
import { questionExit } from "~/components/game-transition";
import { NextQuestionButton } from "~/components/next-question-button";
import { PlayerAvatarGroup } from "~/components/player-avatar-group";
import { QuestionStatusTrack } from "~/components/question-status-track";
import { TimeRemainingBar } from "~/components/time-remaining-bar";
import { createAnswerIndex } from "~/lib/game-data";
import { getStickerSource, stickerAssets } from "~/lib/sticker-assets";
import { AppShell, PageContainer } from "./app-shell";

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
  const markReadyForNextQuestion = useSessionMutation(
    api.players.markReadyForNextQuestion,
  ).withOptimisticUpdate((localStore, args) => {
    const currentPlayers = localStore.getQuery(api.players.allByGameId, { gameId: args.gameId }); // prettier-ignore
    if (!currentPlayers) return;
    localStore.setQuery(
      api.players.allByGameId,
      { gameId: args.gameId },
      currentPlayers.map(
        (player) =>
        player._id === me._id ? { ...player, readyForNextQuestionIndex: args.expectedIndex } : player, // prettier-ignore
      ),
    );
  });

  const answerIndex = useMemo(() => createAnswerIndex(answers), [answers]);
  const phase = game.phase;
  if (!phase) return null;

  // Derive current question.
  const currentQuestion = questions.find(
    (q) => q.index === game.currentQuestionIndex,
  );
  if (!currentQuestion) return null;

  // Derive my answer for the current question.
  const currentAnswerIndex = answerIndex.byQuestionId.get(currentQuestion._id);
  const myAnswerDoc = currentAnswerIndex?.byPlayerId.get(me._id);
  const currentAnswers = currentAnswerIndex?.answers ?? [];

  // Build answer summary per choice.
  const answerSummary = currentQuestion.choices.map((choice) => {
    const choiceAnswers = currentAnswerIndex?.bySelectedLabel.get(choice.label) ?? []; // prettier-ignore
    const voters = choiceAnswers.map((a) => getCharacterByValue(a.character));
    return {
      label: choice.label,
      text: choice.text,
      count: choiceAnswers.length,
      isCorrect: choice.label === currentQuestion.correctLabel,
      voters: phase !== "answering" ? voters : [],
    };
  });

  // Build question results for the status track.
  const questionResults = questions.map((q) => {
    if (q.index > game.currentQuestionIndex) return "incomplete" as const;
    if (q.index === game.currentQuestionIndex && phase === "answering") return "incomplete" as const; // prettier-ignore
    // For past questions and current during results, check player's answer.
    const ans = answerIndex.byQuestionId.get(q._id)?.byPlayerId.get(me._id);
    if (!ans) return "skipped" as const;
    return ans.isCorrect ? ("correct" as const) : ("incorrect" as const);
  });

  // Map each character to whether their answer is correct (presence means they answered).
  const answerCorrectness = new Map(
    currentAnswers.map((a) => [a.character, a.isCorrect]),
  );

  // Map player character values to full character objects.
  const playerCharacters = players.map((p) => getCharacterByValue(p.character));

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
      markReadyForNextQuestion={(expectedIndex: number) => markReadyForNextQuestion({ gameId: game._id, expectedIndex })} // prettier-ignore
      meReadyForNextQuestionIndex={players.find((player) => player._id === me._id)?.readyForNextQuestionIndex} // prettier-ignore
      readyForNextQuestionCount={players.filter((player) => player.readyForNextQuestionIndex === game.currentQuestionIndex).length} // prettier-ignore
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
  markReadyForNextQuestion,
  meReadyForNextQuestionIndex,
  readyForNextQuestionCount,
}: {
  game: Game;
  phase: "answering" | "results" | "explanation";
  currentQuestion: Question;
  myAnswer: string | null;
  answerSummary: {
    label: string;
    text: string;
    count: number;
    isCorrect: boolean;
    voters: Character[];
  }[];
  questionResults: ("correct" | "incorrect" | "skipped" | "incomplete")[];
  questionCount: number;
  playerCharacters: Character[];
  answerCorrectness: Map<string, boolean>;
  submitAnswer: (label: string) => void;
  markReadyForNextQuestion: (expectedIndex: number) => Promise<null>;
  meReadyForNextQuestionIndex: number | undefined;
  readyForNextQuestionCount: number;
}) {
  const { resolvedTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  // Track the local pick with the question index it belongs to. When the
  // question advances, the index won't match and we fall through to the
  // server answer, eliminating the need for effects to reset/sync state.
  const [localPick, setLocalPick] = useState<{ index: number; label: string } | null>(null); // prettier-ignore
  const selectedLabel = localPick !== null && localPick.index === game.currentQuestionIndex && phase === "answering" ? localPick.label : (myAnswer ?? null); // prettier-ignore
  const timeRemaining = useCountdown(game.roundEndsAt, phase === "answering");
  const secondsLeft = phase === "answering" ? Math.ceil(timeRemaining / 1000) : 0; // prettier-ignore
  const showResults = phase !== "answering";
  const showExplanation = phase === "explanation";
  const isAnswering = phase === "answering";
  const hasMarkedReadyForNext = meReadyForNextQuestionIndex === game.currentQuestionIndex; // prettier-ignore
  const isLastQuestion = game.currentQuestionIndex >= questionCount - 1;
  const nextActionLabel = isLastQuestion ? "End game" : "Next question";
  const nextButtonLabel = playerCharacters.length === 1 ? nextActionLabel : `${nextActionLabel} ${readyForNextQuestionCount}/${playerCharacters.length}`; // prettier-ignore
  const correctAnswer = answerSummary.find((choice) => choice.isCorrect);

  const handleSelect = (label: string) => {
    if (phase !== "answering") return;
    setLocalPick({ index: game.currentQuestionIndex, label });
    void submitAnswer(label);
  };

  const handleNext = () => {
    void markReadyForNextQuestion(game.currentQuestionIndex).catch(() => {
      toast.error("Could not mark you ready for the next question.");
    });
  };

  return (
    <AppShell>
      <motion.header className="bg-background/75 sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150">
        <PageContainer className="flex h-16 items-center justify-between border-b">
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
        </PageContainer>
      </motion.header>
      <PageContainer className="flex flex-1 flex-col">
        <motion.main className="flex-1 px-4 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={game.currentQuestionIndex}
              variants={getQuestionVariants(shouldReduceMotion)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                variants={getQuestionItemVariants(shouldReduceMotion)}
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
                variants={getQuestionItemVariants(shouldReduceMotion)}
                className="text-muted-foreground mt-3 text-center text-sm font-medium"
              >
                Question {game.currentQuestionIndex + 1} of {questionCount}
              </motion.h2>
              <motion.h1
                variants={getQuestionItemVariants(shouldReduceMotion)}
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
                    <motion.div
                      key={choice.label}
                      variants={getQuestionItemVariants(shouldReduceMotion)}
                    >
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
      <AnimatePresence>
        {showExplanation && game.roundEndsAt !== undefined && (
          <CardFooter
            key="explanation-footer"
            initial="hidden"
            animate="visible"
            variants={getExplanationCardVariants(shouldReduceMotion)}
          >
            <motion.div
              className="flex justify-center"
              variants={getExplanationItemVariants(shouldReduceMotion)}
            >
              <Image
                className="mt-2 h-auto w-32 drop-shadow-md"
                src={getStickerSource(stickerAssets.why, resolvedTheme)}
                width={stickerAssets.why.width}
                height={stickerAssets.why.height}
                sizes="8rem"
                alt=""
                draggable={false}
              />
            </motion.div>
            {correctAnswer && (
              <motion.div
                className="mt-4 flex min-w-0 justify-center"
                variants={getExplanationItemVariants(shouldReduceMotion)}
              >
                <p className="max-w-full truncate text-sm font-medium">
                  {correctAnswer.label}. {correctAnswer.text}
                </p>
              </motion.div>
            )}
            <motion.p
              className="text-muted-foreground mt-2 text-center text-sm text-pretty"
              variants={getExplanationItemVariants(shouldReduceMotion)}
            >
              Xylitol triggers a sudden insulin release in dogs, causing
              dangerously low blood sugar. At higher doses, it can also cause
              liver failure and may be fatal.
            </motion.p>
            <motion.div
              variants={getExplanationItemVariants(shouldReduceMotion)}
            >
              <NextQuestionButton
                disabled={hasMarkedReadyForNext}
                label={nextButtonLabel}
                roundEndsAt={game.roundEndsAt}
                onClick={handleNext}
                className="mt-5"
              />
            </motion.div>
          </CardFooter>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

// ========================================================================================
// Helpers
// ========================================================================================

const gameplayEntranceTransition = {
  type: "spring" as const,
  visualDuration: 0.3,
  bounce: 0.05,
};

const gameplayEntranceStagger = 0.06;
const reducedMotionTransition = { duration: 0.12 };

function getQuestionVariants(shouldReduceMotion: boolean | null) {
  if (shouldReduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          ...reducedMotionTransition,
          staggerChildren: 0,
        },
      },
      exit: { opacity: 0, transition: reducedMotionTransition },
    };
  }

  return {
    hidden: {
      opacity: 0,
      transform: "translate3d(0, 20px, 0)",
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      transition: {
        ...gameplayEntranceTransition,
        staggerChildren: gameplayEntranceStagger,
      },
    },
    exit: questionExit,
  };
}

function getQuestionItemVariants(shouldReduceMotion: boolean | null) {
  if (shouldReduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: reducedMotionTransition },
    };
  }

  return {
    hidden: {
      opacity: 0,
      transform: "translate3d(0, 10px, 0)",
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      transition: gameplayEntranceTransition,
    },
  };
}

function getExplanationCardVariants(shouldReduceMotion: boolean | null) {
  if (shouldReduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          ...reducedMotionTransition,
          delayChildren: 0,
          staggerChildren: 0,
        },
      },
    };
  }

  return {
    hidden: {
      opacity: 0,
      transform: "translate3d(0, 16px, 0)",
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      transition: {
        ...gameplayEntranceTransition,
        delayChildren: gameplayEntranceStagger,
        staggerChildren: gameplayEntranceStagger,
      },
    },
  };
}

function getExplanationItemVariants(shouldReduceMotion: boolean | null) {
  if (shouldReduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: reducedMotionTransition },
    };
  }

  return {
    hidden: {
      opacity: 0,
      transform: "translate3d(0, 12px, 0)",
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      transition: gameplayEntranceTransition,
    },
  };
}

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
