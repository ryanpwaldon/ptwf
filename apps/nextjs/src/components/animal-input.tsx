"use client";

import { useState } from "react";
import { PawPrint } from "lucide-react";

import type { QuizAnimal } from "@acme/convex";
import { getQuizAnimalByValue, QUIZ_ANIMAL_OPTIONS } from "@acme/convex";
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

import { ImageWithFallback } from "~/components/image-with-fallback";

interface AnimalInputProps {
  value: QuizAnimal;
  onChange: (value: QuizAnimal) => void;
}

export function AnimalInput({ value, onChange }: AnimalInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = getQuizAnimalByValue(value);

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredAnimals = normalizedSearch
    ? QUIZ_ANIMAL_OPTIONS.filter((animal) =>
        `${animal.label} ${animal.description}`
          .toLocaleLowerCase()
          .includes(normalizedSearch),
      )
    : QUIZ_ANIMAL_OPTIONS;

  return (
    <CommandPicker
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setSearch("");
      }}
    >
      <CommandPickerTrigger asChild>
        <Button
          variant="outline"
          className="h-22 w-full cursor-pointer justify-start gap-0 overflow-hidden p-0 whitespace-normal transition-colors!"
        >
          <ImageWithFallback
            fill
            alt={`${selected.label} illustration`}
            src={selected.imagePath}
            icon={<PawPrint className="text-muted-foreground size-1/3" />}
            containerClassName="aspect-square h-full shrink-0"
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

      <CommandPickerContent title="Choose a pet" shouldFilter={false}>
        <CommandPickerInput
          placeholder="Search pets..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandPickerList>
          <CommandPickerEmpty>No pets found.</CommandPickerEmpty>
          <CommandPickerGroup>
            {filteredAnimals.map((animal) => (
              <CommandPickerItem
                key={animal.value}
                value={animal.value}
                data-checked={value === animal.value}
                onSelect={() => {
                  onChange(animal.value);
                  setOpen(false);
                }}
              >
                <ImageWithFallback
                  fill
                  alt={`${animal.label} illustration`}
                  src={animal.imagePath}
                  icon={<PawPrint className="text-muted-foreground size-1/3" />}
                  containerClassName="aspect-square h-18 shrink-0 rounded-sm"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {animal.label}
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {animal.description}
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
