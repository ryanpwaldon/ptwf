"use client";

import { useState } from "react";
import { PawPrint, Search } from "lucide-react";

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

import type { Animal } from "~/lib/animals";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { animals } from "~/lib/animals";

interface AnimalInputProps {
  value: Animal | null;
  onChange: (value: Animal) => void;
  invalid?: boolean;
}

export function AnimalInput({ value, onChange, invalid }: AnimalInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredAnimals = normalizedSearch
    ? animals.filter((animal) =>
        `${animal.label} ${animal.description}`
          .toLocaleLowerCase()
          .includes(normalizedSearch),
      )
    : animals;

  return (
    <CommandPicker
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setSearch("");
      }}
    >
      {value ? (
        <CommandPickerTrigger asChild>
          <Button
            variant="outline"
            className="h-22 w-full cursor-pointer justify-start gap-0 overflow-hidden p-0 whitespace-normal transition-colors!"
          >
            <ImageWithFallback
              fill
              alt={`${value.label} illustration`}
              src={value.imagePath}
              icon={<PawPrint className="text-muted-foreground size-1/3" />}
              containerClassName="aspect-2/3 h-full shrink-0"
            />
            <div className="min-w-0 px-3">
              <div className="truncate text-left font-medium">
                {value.label}
              </div>
              <p className="text-muted-foreground line-clamp-2 text-left text-sm font-normal">
                {value.description}
              </p>
            </div>
          </Button>
        </CommandPickerTrigger>
      ) : (
        <CommandPickerTrigger asChild>
          <Button
            variant="outline"
            aria-invalid={invalid}
            className="text-muted-foreground h-22 w-full cursor-pointer border-dashed"
          >
            <Search className="size-5" />
            <span className="text-sm font-medium">Choose a pet</span>
          </Button>
        </CommandPickerTrigger>
      )}

      <CommandPickerContent title="Choose a pet" shouldFilter={false}>
        <CommandPickerInput
          placeholder="Search pets..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandPickerList>
          <CommandPickerEmpty>No pets found.</CommandPickerEmpty>
          <CommandPickerGroup heading={search ? undefined : "Available pets"}>
            {filteredAnimals.map((animal) => (
              <CommandPickerItem
                key={animal.value}
                value={animal.value}
                data-checked={value?.value === animal.value}
                onSelect={() => {
                  onChange(animal);
                  setOpen(false);
                }}
              >
                <ImageWithFallback
                  fill
                  alt={`${animal.label} illustration`}
                  src={animal.imagePath}
                  icon={<PawPrint className="text-muted-foreground size-1/3" />}
                  containerClassName="aspect-2/3 h-18 shrink-0"
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
