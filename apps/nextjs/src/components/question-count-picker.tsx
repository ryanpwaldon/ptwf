"use client";

import { ListChecksIcon } from "lucide-react";

import type { QuestionCount } from "@acme/convex";
import { isQuestionCount, QUESTION_COUNT_OPTIONS } from "@acme/convex";
import { ToggleGroup, ToggleGroupItem } from "@acme/ui/toggle-group";

interface QuestionCountPickerProps {
  value: number;
  onChange: (questionCount: QuestionCount) => void;
}

export function QuestionCountPicker({
  value,
  onChange,
}: QuestionCountPickerProps) {
  return (
    <div className="flex min-h-14 items-center gap-3">
      <ListChecksIcon className="text-muted-foreground size-4" />
      <span className="min-w-0 flex-1 text-sm font-medium">Questions</span>
      <ToggleGroup
        value={String(value)}
        aria-label="Question count"
        onValueChange={(nextValue) => {
          const questionCount = Number(nextValue);
          if (!isQuestionCount(questionCount)) return;
          onChange(questionCount);
        }}
      >
        {QUESTION_COUNT_OPTIONS.map((count) => (
          <ToggleGroupItem
            key={count}
            value={String(count)}
            aria-label={`${count} questions`}
          >
            {count}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
