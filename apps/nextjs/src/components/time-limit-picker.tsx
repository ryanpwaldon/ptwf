"use client";

import { Clock3Icon } from "lucide-react";

import type { TimeLimitSeconds } from "@acme/convex";
import { isTimeLimitSeconds, TIME_LIMIT_SECONDS_OPTIONS } from "@acme/convex";
import { ToggleGroup, ToggleGroupItem } from "@acme/ui/toggle-group";

interface TimeLimitPickerProps {
  value: number;
  onChange: (timeLimitSeconds: TimeLimitSeconds) => void;
}

export function TimeLimitPicker({ value, onChange }: TimeLimitPickerProps) {
  return (
    <div className="flex min-h-14 items-center gap-3">
      <Clock3Icon className="text-muted-foreground size-4" />
      <span className="min-w-0 flex-1 text-sm font-medium">
        Time per question
      </span>
      <ToggleGroup
        value={String(value)}
        aria-label="Time per question"
        onValueChange={(nextValue) => {
          const timeLimitSeconds = Number(nextValue);
          if (!isTimeLimitSeconds(timeLimitSeconds)) return;
          onChange(timeLimitSeconds);
        }}
      >
        {TIME_LIMIT_SECONDS_OPTIONS.map((seconds) => (
          <ToggleGroupItem
            key={seconds}
            value={String(seconds)}
            aria-label={`${seconds} seconds per question`}
          >
            {seconds}s
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
