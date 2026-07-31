"use node";

import { TMDB } from "@lorenzopant/tmdb";
import { v } from "convex/values";

import { action } from "./_generated/server.js";
import { movieValidator } from "./fields/movie";

function createTmdbClient() {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set.");
  return new TMDB(token);
}

function mapMovie(movie: {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
}) {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path ?? null,
    releaseDate: movie.release_date,
  };
}

export const popular = action({
  args: {},
  returns: v.array(movieValidator),
  handler: async () => {
    const tmdb = createTmdbClient();
    const response = await tmdb.movie_lists.top_rated({ language: "en" });
    return response.results.map(mapMovie);
  },
});

export const search = action({
  args: { title: v.string() },
  returns: v.array(movieValidator),
  handler: async (_ctx, args) => {
    const tmdb = createTmdbClient();
    const response = await tmdb.search.movies({ query: args.title });
    return response.results.map(mapMovie);
  },
});
