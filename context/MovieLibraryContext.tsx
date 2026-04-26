import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type LibraryMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  overview: string | null;
  popularity: number;
  original_language: string;
  original_title: string;
  adult: boolean;
  video: boolean;
  genre_ids: number[];
  savedAt: string;
};

type MovieLibraryState = {
  savedMovies: LibraryMovie[];
  downloadedMovies: LibraryMovie[];
};

type MovieLibraryContextValue = {
  savedMovies: LibraryMovie[];
  downloadedMovies: LibraryMovie[];
  isMovieSaved: (movieId: number) => boolean;
  toggleSavedMovie: (movie: Movie | MovieDetails) => boolean;
  removeSavedMovie: (movieId: number) => void;
};

type BrowserStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

const STORAGE_KEY = "view-net.movie-library";
const EMPTY_LIBRARY_STATE: MovieLibraryState = {
  savedMovies: [],
  downloadedMovies: [],
};

const MovieLibraryContext = createContext<MovieLibraryContextValue | null>(null);

const getBrowserStorage = (): BrowserStorage | null => {
  const storage = (globalThis as { localStorage?: BrowserStorage }).localStorage;

  if (!storage) {
    return null;
  }

  if (
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function"
  ) {
    return null;
  }

  return storage;
};

const readLibraryState = (): MovieLibraryState => {
  const storage = getBrowserStorage();

  if (!storage) {
    return EMPTY_LIBRARY_STATE;
  }

  try {
    const rawState = storage.getItem(STORAGE_KEY);

    if (!rawState) {
      return EMPTY_LIBRARY_STATE;
    }

    const parsedState = JSON.parse(rawState) as Partial<MovieLibraryState>;

    return {
      savedMovies: Array.isArray(parsedState.savedMovies)
        ? parsedState.savedMovies
        : [],
      downloadedMovies: Array.isArray(parsedState.downloadedMovies)
        ? parsedState.downloadedMovies
        : [],
    };
  } catch (error) {
    console.warn("[MovieLibrary] Failed to read library state", error);
    return EMPTY_LIBRARY_STATE;
  }
};

const writeLibraryState = (state: MovieLibraryState) => {
  const storage = getBrowserStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("[MovieLibrary] Failed to write library state", error);
  }
};

const normalizeMovie = (movie: Movie | MovieDetails): LibraryMovie => ({
  id: movie.id,
  title: movie.title,
  poster_path: movie.poster_path ?? null,
  backdrop_path: movie.backdrop_path ?? null,
  release_date: movie.release_date,
  vote_average: movie.vote_average,
  vote_count: movie.vote_count,
  overview: movie.overview ?? null,
  popularity: movie.popularity,
  original_language: movie.original_language,
  original_title: movie.original_title,
  adult: movie.adult,
  video: movie.video,
  genre_ids:
    "genre_ids" in movie ? movie.genre_ids : movie.genres.map(({ id }) => id),
  savedAt: new Date().toISOString(),
});

export const MovieLibraryProvider = ({ children }: { children: ReactNode }) => {
  const [libraryState, setLibraryState] = useState<MovieLibraryState>(() =>
    readLibraryState()
  );

  useEffect(() => {
    writeLibraryState(libraryState);
  }, [libraryState]);

  const isMovieSaved = (movieId: number) =>
    libraryState.savedMovies.some((movie) => movie.id === movieId);

  const toggleSavedMovie = (movie: Movie | MovieDetails) => {
    const alreadySaved = isMovieSaved(movie.id);

    setLibraryState((currentState) => ({
      ...currentState,
      savedMovies: alreadySaved
        ? currentState.savedMovies.filter(
            (savedMovie) => savedMovie.id !== movie.id
          )
        : [normalizeMovie(movie), ...currentState.savedMovies],
    }));

    return !alreadySaved;
  };

  const removeSavedMovie = (movieId: number) => {
    setLibraryState((currentState) => ({
      ...currentState,
      savedMovies: currentState.savedMovies.filter(
        (savedMovie) => savedMovie.id !== movieId
      ),
    }));
  };

  return (
    <MovieLibraryContext.Provider
      value={{
        savedMovies: libraryState.savedMovies,
        downloadedMovies: libraryState.downloadedMovies,
        isMovieSaved,
        toggleSavedMovie,
        removeSavedMovie,
      }}
    >
      {children}
    </MovieLibraryContext.Provider>
  );
};

export const useMovieLibrary = () => {
  const context = useContext(MovieLibraryContext);

  if (!context) {
    throw new Error("useMovieLibrary must be used within a MovieLibraryProvider");
  }

  return context;
};
