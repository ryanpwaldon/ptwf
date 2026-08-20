"use client";

import { useId } from "react";
import { Clock3Icon, ListChecksIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import type { QuestionCount, TimeLimitSeconds } from "@acme/convex";
import {
  isQuestionCount,
  isTimeLimitSeconds,
  QUESTION_COUNT_OPTIONS,
  TIME_LIMIT_SECONDS_OPTIONS,
} from "@acme/convex";
import { ToggleGroup, ToggleGroupItem } from "@acme/ui/toggle-group";

const toggleGroupClassName =
  "bg-foreground/[0.02] gap-0.5 rounded-full! p-[3px]";
const toggleGroupItemClassName =
  "text-muted-foreground/40 hover:bg-transparent hover:text-muted-foreground/40 data-[state=on]:bg-transparent data-[state=on]:text-foreground/60 data-[state=on]:hover:bg-transparent relative h-[22px] min-w-9 rounded-full px-2.5 py-[3px] text-[11px] leading-4 font-normal transition-[color] duration-200 data-[state=on]:font-semibold";

interface GameFormatControlsProps {
  questionCount: number;
  timeLimitSeconds: number;
  onQuestionCountChange: (questionCount: QuestionCount) => void;
  onTimeLimitSecondsChange: (timeLimitSeconds: TimeLimitSeconds) => void;
}

export function GameFormatControls({
  questionCount,
  timeLimitSeconds,
  onQuestionCountChange,
  onTimeLimitSecondsChange,
}: GameFormatControlsProps) {
  const indicatorId = useId();
  const shouldReduceMotion = useReducedMotion();
  const indicatorTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        type: "tween" as const,
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1] as const,
      };

  return (
    <>
      <div className="flex min-h-14 items-center gap-3">
        <ListChecksIcon className="text-muted-foreground size-4" />
        <span className="min-w-0 flex-1 text-sm font-medium">Questions</span>
        <ToggleGroup
          type="single"
          size="sm"
          value={String(questionCount)}
          aria-label="Question count"
          className={toggleGroupClassName}
          onValueChange={(value) => {
            const nextQuestionCount = Number(value);
            if (!isQuestionCount(nextQuestionCount)) return;
            onQuestionCountChange(nextQuestionCount);
          }}
        >
          {QUESTION_COUNT_OPTIONS.map((count) => (
            <ToggleGroupItem
              key={count}
              value={String(count)}
              aria-label={`${count} questions`}
              className={toggleGroupItemClassName}
            >
              {questionCount === count ? (
                <motion.span
                  layoutId={`${indicatorId}-question-count`}
                  className="bg-foreground/[0.035] pointer-events-none absolute inset-0 rounded-full"
                  transition={indicatorTransition}
                />
              ) : null}
              <span className="relative z-10">{count}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="flex min-h-14 items-center gap-3">
        <Clock3Icon className="text-muted-foreground size-4" />
        <span className="min-w-0 flex-1 text-sm font-medium">
          Time per question
        </span>
        <ToggleGroup
          type="single"
          size="sm"
          value={String(timeLimitSeconds)}
          aria-label="Time per question"
          className={toggleGroupClassName}
          onValueChange={(value) => {
            const nextTimeLimitSeconds = Number(value);
            if (!isTimeLimitSeconds(nextTimeLimitSeconds)) return;
            onTimeLimitSecondsChange(nextTimeLimitSeconds);
          }}
        >
          {TIME_LIMIT_SECONDS_OPTIONS.map((seconds) => (
            <ToggleGroupItem
              key={seconds}
              value={String(seconds)}
              aria-label={`${seconds} seconds per question`}
              className={toggleGroupItemClassName}
            >
              {timeLimitSeconds === seconds ? (
                <motion.span
                  layoutId={`${indicatorId}-time-limit`}
                  className="bg-foreground/[0.035] pointer-events-none absolute inset-0 rounded-full"
                  transition={indicatorTransition}
                />
              ) : null}
              <span className="relative z-10">{seconds}s</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </>
  );
}
