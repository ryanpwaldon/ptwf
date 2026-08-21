"use client";

import { useState } from "react";
import { ChevronDownIcon, InfoIcon, SparklesIcon } from "lucide-react";

import type { QuizModel, QuizModelOption } from "@acme/convex";
import { getQuizModelByValue, QUIZ_MODEL_OPTIONS } from "@acme/convex";
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
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@acme/ui/popover";

function ModelIcon({ model }: { model: QuizModelOption }) {
  return (
    <span
      aria-hidden
      className="bg-muted-foreground block size-4 shrink-0"
      style={{
        maskImage: `url(${model.iconPath})`,
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskImage: `url(${model.iconPath})`,
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
      }}
    />
  );
}

interface ModelPickerProps {
  value: QuizModel;
  onChange: (value: QuizModel) => void;
}

export function ModelPicker({ value, onChange }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const model = getQuizModelByValue(value);

  return (
    <div className="flex min-h-14 items-center gap-3">
      <SparklesIcon className="text-muted-foreground size-4" />
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <span className="text-sm font-medium">Model</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="About model selection"
              className="text-muted-foreground hover:bg-control-hover hover:text-foreground aria-expanded:bg-control-hover aria-expanded:text-foreground dark:hover:bg-control-hover"
            >
              <InfoIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-64"
          >
            <PopoverHeader>
              <PopoverTitle>Choose a model</PopoverTitle>
              <PopoverDescription>
                Choose which AI model generates the questions for your game.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </div>
      <CommandPicker open={open} onOpenChange={setOpen}>
        <CommandPickerTrigger asChild>
          <Button
            variant="outline"
            aria-label={`Model: ${model.label}`}
            className="min-w-40 cursor-pointer justify-start"
          >
            <ModelIcon model={model} />
            <span className="min-w-0 flex-1 truncate text-left">
              {model.label}
            </span>
            <ChevronDownIcon className="text-muted-foreground size-4" />
          </Button>
        </CommandPickerTrigger>
        <CommandPickerContent title="Choose a model">
          <CommandPickerInput placeholder="Search models..." />
          <CommandPickerList>
            <CommandPickerEmpty>No models found.</CommandPickerEmpty>
            <CommandPickerGroup>
              {QUIZ_MODEL_OPTIONS.map((option) => (
                <CommandPickerItem
                  key={option.value}
                  value={`${option.label} ${option.provider}`}
                  data-checked={value === option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <ModelIcon model={option} />
                  <span className="min-w-0 truncate text-sm font-medium">
                    {option.label}
                  </span>
                </CommandPickerItem>
              ))}
            </CommandPickerGroup>
          </CommandPickerList>
        </CommandPickerContent>
      </CommandPicker>
    </div>
  );
}
