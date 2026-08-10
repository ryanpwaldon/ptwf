"use client";

import { Clock3Icon, ListChecksIcon } from "lucide-react";

import type { QuestionCount, TimeLimitSeconds } from "@acme/convex";
import {
  isQuestionCount,
  isTimeLimitSeconds,
  QUESTION_COUNT_OPTIONS,
  TIME_LIMIT_SECONDS_OPTIONS,
} from "@acme/convex";
import { ToggleGroup, ToggleGroupItem } from "@acme/ui/toggle-group";

interface GameSettingsInputProps {
  questionCount: number;
  timeLimitSeconds: number;
  onQuestionCountChange: (questionCount: QuestionCount) => void;
  onTimeLimitSecondsChange: (timeLimitSeconds: TimeLimitSeconds) => void;
}

export function GameSettingsInput({
  questionCount,
  timeLimitSeconds,
  onQuestionCountChange,
  onTimeLimitSecondsChange,
}: GameSettingsInputProps) {
  return (
    <>
      <div className="flex min-h-14 items-center gap-3 px-4 py-2">
        <ListChecksIcon className="text-muted-foreground size-4" />
        <span className="min-w-0 flex-1 text-sm font-medium">Questions</span>
        <ToggleGroup
          type="single"
          size="sm"
          value={String(questionCount)}
          aria-label="Question count"
          className="bg-muted gap-0.5 p-0.5"
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
              className="data-[state=on]:bg-card h-7 min-w-9 rounded-md px-2 data-[state=on]:shadow-sm"
            >
              {count}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="flex min-h-14 items-center gap-3 px-4 py-2">
        <Clock3Icon className="text-muted-foreground size-4" />
        <span className="min-w-0 flex-1 text-sm font-medium">
          Time per question
        </span>
        <ToggleGroup
          type="single"
          size="sm"
          value={String(timeLimitSeconds)}
          aria-label="Time per question"
          className="bg-muted gap-0.5 p-0.5"
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
              className="data-[state=on]:bg-card h-7 min-w-9 rounded-md px-2 data-[state=on]:shadow-sm"
            >
              {seconds}s
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </>
  );
}
