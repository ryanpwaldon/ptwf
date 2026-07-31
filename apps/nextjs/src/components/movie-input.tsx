"use client";

import type { FunctionReturnType } from "convex/server";
import { useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { Film, Search } from "lucide-react";

import { api } from "@acme/convex";
import { Button } from "@acme/ui/button";
import {
  CommandPicker,
  CommandPickerContent,
  CommandPickerEmpty,
  CommandPickerGroup,
  CommandPickerInput,
  CommandPickerItem,
  CommandPickerList,
  CommandPickerLoading,
  CommandPickerTrigger,
} from "@acme/ui/command-picker";

import { ImageWithFallback } from "~/components/image-with-fallback";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import { extractYear } from "~/lib/date";
import { tmdbPosterUrl } from "~/lib/tmdb";

type Movie = FunctionReturnType<typeof api.movies.popular>[number];

interface MovieInputProps {
  value: Movie | null;
  onChange: (value: Movie) => void;
  invalid?: boolean;
}

export function MovieInput({ value, onChange, invalid }: MovieInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const popularCacheRef = useRef<Movie[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useDebouncedValue(search, 300);
  const generationRef = useRef(0);

  const fetchPopular = useAction(api.movies.popular);
  const searchMovies = useAction(api.movies.search);

  // Fetch popular movies once on mount.
  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const results = await fetchPopular();
        popularCacheRef.current = results;
        setMovies(results);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchPopular]);

  // Reset search and restore popular movies when dialog opens.
  useEffect(() => {
    if (!open) return;
    setSearch("");
    setDebouncedSearch("");
    generationRef.current++;
    setMovies(popularCacheRef.current);
  }, [open, setDebouncedSearch]);

  // Search when debounced value changes.
  useEffect(() => {
    if (!open) return;
    if (!debouncedSearch) {
      setMovies(popularCacheRef.current);
      return;
    }

    const generation = generationRef.current;
    setLoading(true);
    void searchMovies({ title: debouncedSearch })
      .then((results) => {
        if (generationRef.current !== generation) return;
        setMovies(results);
      })
      .finally(() => {
        if (generationRef.current !== generation) return;
        setLoading(false);
      });
  }, [debouncedSearch, open, searchMovies]);

  return (
    <CommandPicker open={open} onOpenChange={setOpen}>
      {value ? (
        <CommandPickerTrigger asChild>
          <Button
            variant="outline"
            className="h-22 w-full cursor-pointer justify-start gap-0 overflow-hidden p-0 whitespace-normal transition-colors!"
          >
            <ImageWithFallback
              fill
              alt={`${value.title} poster`}
              src={tmdbPosterUrl(value.posterPath)}
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
            <span className="text-sm font-medium">Search movies</span>
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
          {loading ? (
            <CommandPickerLoading>Searching...</CommandPickerLoading>
          ) : (
            <>
              <CommandPickerEmpty>No movies found.</CommandPickerEmpty>
              <CommandPickerGroup
                heading={search ? undefined : "Popular movies"}
              >
                {movies.map((movie) => (
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
                      src={tmdbPosterUrl(movie.posterPath)}
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
            </>
          )}
        </CommandPickerList>
      </CommandPickerContent>
    </CommandPicker>
  );
}
