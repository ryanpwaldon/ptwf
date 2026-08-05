"use client";

import { useState } from "react";

import type { QuizTheme } from "@acme/convex";
import { getQuizThemeByValue, QUIZ_THEME_OPTIONS } from "@acme/convex";
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

interface ThemeInputProps {
  value: QuizTheme;
  onChange: (value: QuizTheme) => void;
}

export function ThemeInput({ value, onChange }: ThemeInputProps) {
  const [open, setOpen] = useState(false);
  const selected = getQuizThemeByValue(value);

  return (
    <CommandPicker open={open} onOpenChange={setOpen}>
      <CommandPickerTrigger asChild>
        <Button
          variant="outline"
          className="h-22 w-full cursor-pointer justify-start gap-0 overflow-hidden p-0 whitespace-normal transition-colors!"
        >
          <div
            className={`aspect-2/3 h-full shrink-0 overflow-hidden p-1 ${selected.posterClassName}`}
          >
            <p className="text-left text-[12px] leading-none font-bold whitespace-pre-line text-white">
              {selected.posterLabel}
            </p>
          </div>
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
      <CommandPickerContent title="Choose a topic">
        <CommandPickerInput placeholder="Search topics..." />
        <CommandPickerList>
          <CommandPickerEmpty>No topics found.</CommandPickerEmpty>
          <CommandPickerGroup>
            {QUIZ_THEME_OPTIONS.map((option) => (
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
                  className={`aspect-2/3 h-18 shrink-0 overflow-hidden rounded p-1 ${option.posterClassName}`}
                >
                  <p className="text-left text-[10px] leading-none font-bold whitespace-pre-line text-white">
                    {option.posterLabel}
                  </p>
                </div>
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
