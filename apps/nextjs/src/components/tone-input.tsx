"use client";

import { useState } from "react";

import type { QuizTone } from "@acme/convex";
import { getQuizToneByValue, QUIZ_TONE_OPTIONS } from "@acme/convex";
import { Button } from "@acme/ui/button";
import {
  CommandPicker,
  CommandPickerContent,
  CommandPickerEmpty,
  CommandPickerGroup,
  CommandPickerInput,
  CommandPickerItem,
  CommandPickerList,
  CommandPickerTrigger,
} from "@acme/ui/command-picker";

interface ToneInputProps {
  value: QuizTone;
  onChange: (value: QuizTone) => void;
}

export function ToneInput({ value, onChange }: ToneInputProps) {
  const [open, setOpen] = useState(false);
  const selected = getQuizToneByValue(value);

  return (
    <CommandPicker open={open} onOpenChange={setOpen}>
      <CommandPickerTrigger asChild>
        <Button
          variant="outline"
          className="h-22 w-full cursor-pointer justify-start gap-0 overflow-hidden p-0 whitespace-normal transition-colors!"
        >
          <div
            className={`aspect-2/3 h-full shrink-0 ${selected.posterClassName}`}
          />
          <div className="min-w-0 px-3">
            <div className="truncate text-left font-medium">
              {selected.label}
            </div>
            <p className="text-muted-foreground line-clamp-2 text-left text-sm font-normal">
              {selected.description}
            </p>
          </div>
        </Button>
      </CommandPickerTrigger>
      <CommandPickerContent title="Select a tone">
        <CommandPickerInput placeholder="Search tones..." />
        <CommandPickerList>
          <CommandPickerEmpty>No tones found.</CommandPickerEmpty>
          <CommandPickerGroup>
            {QUIZ_TONE_OPTIONS.map((option) => (
              <CommandPickerItem
                key={option.value}
                value={option.label}
                data-checked={value === option.value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <div
                  className={`aspect-2/3 h-18 shrink-0 rounded-md ${option.posterClassName}`}
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {option.label}
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {option.description}
                  </p>
                </div>
              </CommandPickerItem>
            ))}
          </CommandPickerGroup>
        </CommandPickerList>
      </CommandPickerContent>
    </CommandPicker>
  );
}
