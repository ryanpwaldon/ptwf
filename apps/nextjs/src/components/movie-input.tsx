"use client";

import { useState } from "react";
import { Film, Search } from "lucide-react";

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

import type { Movie } from "~/lib/movies";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { extractYear } from "~/lib/date";
import { movies } from "~/lib/movies";

interface MovieInputProps {
  value: Movie | null;
  onChange: (value: Movie) => void;
  invalid?: boolean;
}

export function MovieInput({ value, onChange, invalid }: MovieInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredMovies = normalizedSearch
    ? movies.filter((movie) =>
        `${movie.title} ${extractYear(movie.releaseDate)}`
          .toLocaleLowerCase()
          .includes(normalizedSearch),
      )
    : movies;

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
              alt={`${value.title} poster`}
              src={value.posterPath}
              icon={<Film className="text-muted-foreground size-1/3" />}
              containerClassName="aspect-2/3 h-full shrink-0"
            />
            <div className="min-w-0 px-3">
              <div className="truncate text-left font-medium">
                {value.title}
                {extractYear(value.releaseDate) ? (
                  <span className="text-muted-foreground">
                    {" "}
                    ({extractYear(value.releaseDate)})
                  </span>
                ) : null}
              </div>
              <p className="text-muted-foreground line-clamp-2 text-left text-sm font-normal">
                {value.overview}
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
            <span className="text-sm font-medium">Choose a movie</span>
          </Button>
        </CommandPickerTrigger>
      )}

      <CommandPickerContent title="Select a movie" shouldFilter={false}>
        <CommandPickerInput
          placeholder="Search movies..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandPickerList>
          <CommandPickerEmpty>No movies found.</CommandPickerEmpty>
          <CommandPickerGroup heading={search ? undefined : "Available movies"}>
            {filteredMovies.map((movie) => (
              <CommandPickerItem
                key={movie.id}
                value={String(movie.id)}
                data-checked={value?.id === movie.id}
                onSelect={() => {
                  onChange(movie);
                  setOpen(false);
                }}
              >
                <ImageWithFallback
                  fill
                  alt={`${movie.title} poster`}
                  src={movie.posterPath}
                  icon={<Film className="text-muted-foreground size-1/3" />}
                  containerClassName="aspect-2/3 h-18 shrink-0"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {movie.title}
                    {extractYear(movie.releaseDate) ? (
                      <span className="text-muted-foreground">
                        {" "}
                        ({extractYear(movie.releaseDate)})
                      </span>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {movie.overview}
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
