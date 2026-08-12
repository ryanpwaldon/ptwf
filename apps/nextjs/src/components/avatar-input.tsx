"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import type { CharacterValue } from "@acme/convex";
import { CHARACTER_OPTIONS, getCharacterByValue } from "@acme/convex";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  CommandItemEnd,
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
          variant="outline"
          className="h-12 w-full cursor-pointer justify-start gap-3 rounded-full pr-3 pl-[5px] transition-colors"
        >
          <Avatar className="size-9">
            <AvatarImage
              src={character.image}
              alt={`${character.label} avatar`}
              className="object-cover"
            />
            <AvatarFallback>{character.label.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
            {character.label}
          </span>
          <ChevronDownIcon className="text-muted-foreground size-4" />
        </Button>
      </CommandPickerTrigger>
      <CommandPickerContent title="Choose a character">
        <CommandPickerInput placeholder="Search characters..." />
        <CommandPickerList>
          <CommandPickerEmpty>No characters found.</CommandPickerEmpty>
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
                <Avatar>
                  <AvatarImage
                    src={option.image}
                    alt=""
                    className="object-cover"
                  />
                  <AvatarFallback>{option.label.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{option.label}</span>
                {takenValues.includes(option.value) ? (
                  <CommandItemEnd>
                    <Badge variant="secondary">Taken</Badge>
                  </CommandItemEnd>
                ) : null}
              </CommandPickerItem>
            ))}
          </CommandPickerGroup>
        </CommandPickerList>
      </CommandPickerContent>
    </CommandPicker>
  );
}
