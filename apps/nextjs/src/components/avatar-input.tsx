"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import type { CharacterValue } from "@acme/convex";
import { CHARACTER_OPTIONS, getCharacterByValue } from "@acme/convex";
import { Avatar, AvatarBadge, AvatarFallback } from "@acme/ui/avatar";
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

interface AvatarInputProps {
  value: CharacterValue;
  takenValues: CharacterValue[];
  onChange: (value: CharacterValue) => void;
}

export function AvatarInput({
  value,
  takenValues,
  onChange,
}: AvatarInputProps) {
  const [open, setOpen] = useState(false);
  const character = getCharacterByValue(value);

  return (
    <CommandPicker open={open} onOpenChange={setOpen}>
      <CommandPickerTrigger asChild>
        <Button
          variant="ghost"
          className="size-auto cursor-pointer rounded-full p-0"
        >
          <Avatar size="lg" tooltip={character.label}>
            <AvatarFallback className={character.color} />
            <AvatarBadge>
              <Pencil />
            </AvatarBadge>
          </Avatar>
        </Button>
      </CommandPickerTrigger>
      <CommandPickerContent title="Choose a colour">
        <CommandPickerInput placeholder="Search colours..." />
        <CommandPickerList>
          <CommandPickerEmpty>No colours found.</CommandPickerEmpty>
          <CommandPickerGroup>
            {CHARACTER_OPTIONS.map((option) => (
              <CommandPickerItem
                key={option.value}
                value={option.label}
                data-checked={value === option.value}
                disabled={takenValues.includes(option.value)}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <div
                  aria-hidden
                  className={`size-6 shrink-0 rounded-full ${option.color}`}
                />
                <span className="text-sm font-medium">{option.label}</span>
              </CommandPickerItem>
            ))}
          </CommandPickerGroup>
        </CommandPickerList>
      </CommandPickerContent>
    </CommandPicker>
  );
}
