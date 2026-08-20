"use client";

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

const toggleGroupClassName = "bg-control-track gap-0.5 rounded-full! p-[3px]";
const toggleGroupItemClassName =
  "text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground/60 data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:hover:bg-transparent relative z-10 h-7 min-w-9 rounded-full px-2.5 text-xs font-medium transition-[color] duration-200";

function getIndicatorTransform(index: number) {
  const safeIndex = Math.max(index, 0);
  return `translateX(calc(${safeIndex * 100}% + ${safeIndex * 2}px))`;
}

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
  const shouldReduceMotion = useReducedMotion();
  const questionCountIndex = QUESTION_COUNT_OPTIONS.findIndex(
    (count) => count === questionCount,
  );
  const timeLimitIndex = TIME_LIMIT_SECONDS_OPTIONS.findIndex(
    (seconds) => seconds === timeLimitSeconds,
  );
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
          className={`${toggleGroupClassName} relative grid! auto-cols-fr grid-flow-col`}
          onValueChange={(value) => {
            const nextQuestionCount = Number(value);
            if (!isQuestionCount(nextQuestionCount)) return;
            onQuestionCountChange(nextQuestionCount);
          }}
        >
          <motion.span
            aria-hidden
            initial={false}
            className="border-border bg-card pointer-events-none absolute inset-y-[3px] left-[3px] z-0 w-[calc((100%_-_10px)/3)] rounded-full border"
            animate={{
              transform: getIndicatorTransform(questionCountIndex),
            }}
            transition={indicatorTransition}
          />
          {QUESTION_COUNT_OPTIONS.map((count) => (
            <ToggleGroupItem
              key={count}
              value={String(count)}
              aria-label={`${count} questions`}
              className={toggleGroupItemClassName}
            >
              {count}
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
          className={`${toggleGroupClassName} relative grid! auto-cols-fr grid-flow-col`}
          onValueChange={(value) => {
            const nextTimeLimitSeconds = Number(value);
            if (!isTimeLimitSeconds(nextTimeLimitSeconds)) return;
            onTimeLimitSecondsChange(nextTimeLimitSeconds);
          }}
        >
          <motion.span
            aria-hidden
            initial={false}
            className="border-border bg-card pointer-events-none absolute inset-y-[3px] left-[3px] z-0 w-[calc((100%_-_10px)/3)] rounded-full border"
            animate={{ transform: getIndicatorTransform(timeLimitIndex) }}
            transition={indicatorTransition}
          />
          {TIME_LIMIT_SECONDS_OPTIONS.map((seconds) => (
            <ToggleGroupItem
              key={seconds}
              value={String(seconds)}
              aria-label={`${seconds} seconds per question`}
              className={toggleGroupItemClassName}
            >
              {seconds}s
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </>
  );
}
