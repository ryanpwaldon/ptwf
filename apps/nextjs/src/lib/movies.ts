export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
}

export const movies: Movie[] = [
  {
    id: 278,
    title: "The Shawshank Redemption",
    overview:
      "Two imprisoned men form a lasting friendship and find hope over many years behind bars.",
    posterPath: "/movie-posters/the-shawshank-redemption.jpg",
    releaseDate: "1994-09-23",
  },
  {
    id: 238,
    title: "The Godfather",
    overview:
      "The aging head of a crime family transfers control of his empire to his reluctant son.",
    posterPath: "/movie-posters/the-godfather.jpg",
    releaseDate: "1972-03-14",
  },
  {
    id: 155,
    title: "The Dark Knight",
    overview:
      "Batman faces a criminal mastermind whose reign of chaos pushes Gotham and its heroes to their limits.",
    posterPath: "/movie-posters/the-dark-knight.webp",
    releaseDate: "2008-07-16",
  },
  {
    id: 122,
    title: "The Lord of the Rings: The Return of the King",
    overview:
      "The Fellowship makes its final stand as Frodo and Sam approach Mount Doom.",
    posterPath: "/movie-posters/the-return-of-the-king.jpg",
    releaseDate: "2003-12-17",
  },
  {
    id: 13,
    title: "Forrest Gump",
    overview:
      "A kind-hearted man unwittingly finds himself present at defining moments in American history.",
    posterPath: "/movie-posters/forrest-gump.jpg",
    releaseDate: "1994-06-23",
  },
  {
    id: 27205,
    title: "Inception",
    overview:
      "A skilled thief who steals secrets through dreams is offered a chance to erase his past.",
    posterPath: "/movie-posters/inception.jpg",
    releaseDate: "2010-07-15",
  },
  {
    id: 157336,
    title: "Interstellar",
    overview:
      "A team of explorers travels through a wormhole in search of a future home for humanity.",
    posterPath: "/movie-posters/interstellar.jpg",
    releaseDate: "2014-11-05",
  },
  {
    id: 603,
    title: "The Matrix",
    overview:
      "A computer hacker discovers that the world he knows is a simulated reality.",
    posterPath: "/movie-posters/the-matrix.jpg",
    releaseDate: "1999-03-30",
  },
  {
    id: 129,
    title: "Spirited Away",
    overview:
      "A young girl enters a world ruled by spirits and must find the courage to save her parents.",
    posterPath: "/movie-posters/spirited-away.jpg",
    releaseDate: "2001-07-20",
  },
  {
    id: 496243,
    title: "Parasite",
    overview:
      "A struggling family gradually works its way into the home of a wealthy household.",
    posterPath: "/movie-posters/parasite.jpg",
    releaseDate: "2019-05-30",
  },
  {
    id: 105,
    title: "Back to the Future",
    overview:
      "A teenager travels back to 1955 and must ensure his parents fall in love.",
    posterPath: "/movie-posters/back-to-the-future.jpg",
    releaseDate: "1985-07-03",
  },
  {
    id: 550,
    title: "Fight Club",
    overview:
      "A disillusioned office worker and a charismatic soap maker create an underground fight club.",
    posterPath: "/movie-posters/fight-club.jpg",
    releaseDate: "1999-10-15",
  },
  {
    id: 862,
    title: "Toy Story",
    overview:
      "A cowboy doll feels threatened when a flashy new space ranger becomes his owner's favourite toy.",
    posterPath: "/movie-posters/toy-story.jpg",
    releaseDate: "1995-10-30",
  },
  {
    id: 372058,
    title: "Your Name",
    overview:
      "Two teenagers mysteriously begin swapping bodies and form a connection across distance and time.",
    posterPath: "/movie-posters/your-name.jpg",
    releaseDate: "2016-08-26",
  },
];
