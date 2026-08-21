"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

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

type ModelSpeed = "Fast" | "Moderate" | "Slow";

interface ModelOption {
  value: string;
  label: string;
  provider: string;
  speed: ModelSpeed;
  iconSrc: string;
}

const MODEL_OPTIONS = [
  {
    value: "gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    provider: "OpenAI",
    speed: "Fast",
    iconSrc: "/models/openai.svg",
  },
  {
    value: "claude-sonnet-5",
    label: "Claude Sonnet 5",
    provider: "Anthropic",
    speed: "Moderate",
    iconSrc: "/models/anthropic.svg",
  },
  {
    value: "gemini-3.7-flash",
    label: "Gemini 3.7 Flash",
    provider: "Google",
    speed: "Fast",
    iconSrc: "/models/google.svg",
  },
  {
    value: "deepseek-v4-pro",
    label: "DeepSeek-V4-Pro",
    provider: "DeepSeek",
    speed: "Slow",
    iconSrc: "/models/deepseek.svg",
  },
  {
    value: "kimi-k3",
    label: "Kimi K3",
    provider: "Moonshot",
    speed: "Moderate",
    iconSrc: "/models/moonshot.svg",
  },
] as const satisfies readonly ModelOption[];

type ModelValue = (typeof MODEL_OPTIONS)[number]["value"];

function ModelIcon({ model }: { model: ModelOption }) {
  return (
    <span
      aria-hidden
      className="block size-4 shrink-0 bg-current"
      style={{
        maskImage: `url(${model.iconSrc})`,
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskImage: `url(${model.iconSrc})`,
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
      }}
    />
  );
}

function ModelOptionIcon({ model }: { model: ModelOption }) {
  return (
    <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
      <ModelIcon model={model} />
    </span>
  );
}

export function ModelPicker() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<ModelValue>(MODEL_OPTIONS[0].value);
  const model =
    MODEL_OPTIONS.find((option) => option.value === value) ?? MODEL_OPTIONS[0];

  return (
    <CommandPicker open={open} onOpenChange={setOpen}>
      <CommandPickerTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Model: ${model.label}`}
          className="min-w-40 cursor-pointer justify-start"
        >
          <span className="text-muted-foreground">
            <ModelIcon model={model} />
          </span>
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
            {MODEL_OPTIONS.map((option) => (
              <CommandPickerItem
                key={option.value}
                value={`${option.label} ${option.provider} ${option.speed}`}
                data-checked={value === option.value}
                onSelect={() => {
                  setValue(option.value);
                  setOpen(false);
                }}
              >
                <ModelOptionIcon model={option} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {option.label}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {option.speed}
                  </span>
                </span>
              </CommandPickerItem>
            ))}
          </CommandPickerGroup>
        </CommandPickerList>
      </CommandPickerContent>
    </CommandPicker>
  );
}
