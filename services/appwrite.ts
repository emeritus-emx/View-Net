import { Account, Client, ID, Models, Query, TablesDB } from "appwrite";

const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const APPWRITE_TABLE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID ||
  process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID;
const ACTIONS_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_ACTIONS_TABLE_ID;
const PREFS_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_PREFS_TABLE_ID;
const SUB_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_SUB_TABLE_ID;

const APPWRITE_ENDPOINT =
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
  "https://tor.cloud.appwrite.io/v1";

type TrendingMovieRow = Models.DefaultRow & TrendingMovie;
type ProfileUserPreferences = {
  avatar?: string;
  [key: string]: unknown;
};

export type ProfileUser = Models.User<ProfileUserPreferences>;
export type ProfileActionRow = Models.DefaultRow & {
  actionType?: string;
  genre?: string;
  hours?: number;
  movieTitle?: string;
  poster?: string;
  timeLeft?: number | string;
};
export type ProfilePreferenceRow = Models.DefaultRow & {
  language?: string;
  notifications?: boolean;
  subtitles?: string;
  quality?: string;
};
export type ProfileSubscriptionRow = Models.DefaultRow & {
  plan?: string;
};
export type ProfileData = {
  user: ProfileUser | null;
  actions: ProfileActionRow[];
  preferences: ProfilePreferenceRow | null;
  subscription: ProfileSubscriptionRow | null;
};

const client = APPWRITE_PROJECT_ID
  ? new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID)
  : null;
const account = client ? new Account(client) : null;
const tablesDB = client ? new TablesDB(client) : null;

const EMPTY_PROFILE_DATA: ProfileData = {
  user: null,
  actions: [],
  preferences: null,
  subscription: null,
};

const logAppwriteError = (action: string, error: unknown) => {
  console.error(`[Appwrite] ${action} failed`, {
    endpoint: APPWRITE_ENDPOINT,
    databaseId: APPWRITE_DATABASE_ID,
    searchTableId: APPWRITE_TABLE_ID,
    actionsTableId: ACTIONS_TABLE_ID,
    prefsTableId: PREFS_TABLE_ID,
    subscriptionTableId: SUB_TABLE_ID,
    error,
  });
};

const warnAppwriteConfig = (action: string, requiredVars: string[]) => {
  console.warn(
    `[Appwrite] Skipping ${action} because configuration is incomplete. ` +
      `Check ${requiredVars.join(", ")}.`
  );
};

const getUserIdQueries = (userId: string) => [Query.equal("userId", userId)];

export const getCurrentUserProfile = async (): Promise<ProfileData> => {
  if (
    !account ||
    !tablesDB ||
    !APPWRITE_DATABASE_ID ||
    !ACTIONS_TABLE_ID ||
    !PREFS_TABLE_ID ||
    !SUB_TABLE_ID
  ) {
    warnAppwriteConfig("profile lookup", [
      "EXPO_PUBLIC_APPWRITE_PROJECT_ID",
      "EXPO_PUBLIC_APPWRITE_DATABASE_ID",
      "EXPO_PUBLIC_APPWRITE_ACTIONS_TABLE_ID",
      "EXPO_PUBLIC_APPWRITE_PREFS_TABLE_ID",
      "EXPO_PUBLIC_APPWRITE_SUB_TABLE_ID",
    ]);
    return EMPTY_PROFILE_DATA;
  }

  try {
    const user = await account.get<ProfileUserPreferences>();
    const queries = getUserIdQueries(user.$id);

    const [actionsRes, prefRes, subRes] = await Promise.all([
      tablesDB.listRows<ProfileActionRow>({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: ACTIONS_TABLE_ID,
        queries,
      }),
      tablesDB.listRows<ProfilePreferenceRow>({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: PREFS_TABLE_ID,
        queries,
      }),
      tablesDB.listRows<ProfileSubscriptionRow>({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: SUB_TABLE_ID,
        queries,
      }),
    ]);

    return {
      user,
      actions: actionsRes.rows ?? [],
      preferences: prefRes.rows[0] ?? null,
      subscription: subRes.rows[0] ?? null,
    };
  } catch (error) {
    logAppwriteError("profile lookup", error);
    return EMPTY_PROFILE_DATA;
  }
};

export const updateSearchCount = async (
  query: string,
  movie: Movie
): Promise<boolean> => {
  if (!tablesDB || !APPWRITE_DATABASE_ID || !APPWRITE_TABLE_ID) {
    warnAppwriteConfig("search analytics update", [
      "EXPO_PUBLIC_APPWRITE_PROJECT_ID",
      "EXPO_PUBLIC_APPWRITE_DATABASE_ID",
      "EXPO_PUBLIC_APPWRITE_TABLE_ID",
    ]);
    return false;
  }

  try {
    const result = await tablesDB.listRows<TrendingMovieRow>({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID,
      queries: [Query.equal("searchTerm", query.trim())],
    });

    if (result.rows.length > 0) {
      const existingMovie = result.rows[0];

      await tablesDB.updateRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_TABLE_ID,
        rowId: existingMovie.$id,
        data: {
          count: Number(existingMovie.count ?? 0) + 1,
        },
      });
    } else {
      await tablesDB.createRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_TABLE_ID,
        rowId: ID.unique(),
        data: {
          searchTerm: query.trim(),
          movie_id: movie.id,
          title: movie.title,
          count: 1,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        },
      });
    }

    return true;
  } catch (error) {
    logAppwriteError("search analytics update", error);
    return false;
  }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
  if (!tablesDB || !APPWRITE_DATABASE_ID || !APPWRITE_TABLE_ID) {
    warnAppwriteConfig("trending movies lookup", [
      "EXPO_PUBLIC_APPWRITE_PROJECT_ID",
      "EXPO_PUBLIC_APPWRITE_DATABASE_ID",
      "EXPO_PUBLIC_APPWRITE_TABLE_ID",
    ]);
    return [];
  }

  try {
    const result = await tablesDB.listRows<TrendingMovieRow>({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID,
      queries: [Query.limit(5), Query.orderDesc("count")],
    });

    return result.rows.map((row) => ({
      searchTerm: row.searchTerm,
      movie_id: Number(row.movie_id),
      title: row.title,
      count: Number(row.count),
      poster_url: row.poster_url,
    }));
  } catch (error) {
    logAppwriteError("trending movies lookup", error);
    return [];
  }
};