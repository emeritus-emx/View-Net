import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { useMovieLibrary } from "@/context/MovieLibraryContext";
import { fetchMovieDetails } from "@/services/api";
import useFetch from "@/services/usefetch";

const POSTER_FALLBACK =
  "https://placehold.co/600x900/030A1D/D6C7FF.png?text=No+Poster";
const BACKDROP_FALLBACK =
  "https://placehold.co/1200x800/030A1D/D6C7FF.png?text=Movie+Backdrop";

const buildImageUri = (
  path: string | null | undefined,
  size: "w500" | "w780",
  fallback: string
) => (path ? `https://image.tmdb.org/t/p/${size}${path}` : fallback);

const formatRuntime = (runtime: number | null | undefined) => {
  if (!runtime) {
    return "Runtime TBD";
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
};

const formatCompactCurrency = (value: number | null | undefined) => {
  if (!value) {
    return "Unknown";
  }

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }

  return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
};

const joinList = (values: string[], fallback = "Not available") =>
  values.length ? values.join(" / ") : fallback;

const formatVoteAverage = (value: number | null | undefined) =>
  (value ?? 0).toFixed(1);

type MovieChipProps = {
  label: string;
};

const MovieChip = ({ label }: MovieChipProps) => (
  <View className="mr-2 mt-2 -skew-x-12 slan border border-[black] bg-[#07122F] px-4 py-2">
    <Text className="text-[11px] font-semibold uppercase text-light-200">
      {label}
    </Text>
    
  </View>
);

type SectionCardProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

const SectionCard = ({ eyebrow, title, children }: SectionCardProps) => (
  <View className="mt-5-skew-x-12 slan border border-[black] bg-[#050518] p-5">
    <Text style={styles.eyebrow}>{eyebrow}</Text>
    <Text className="mt-2 text-xl font-bold text-white">{title}</Text>
    <View className="mt-4">{children}</View>
  </View>
);

type StatTileProps = {
  label: string;
  value: string;
};

const StatTile = ({ label, value }: StatTileProps) => (
  <View className="mb-3 w-[48%] rounded-[24px] border border-[black] bg-[#050518] p-4">
    <Text style={styles.eyebrow}>{label}</Text>
    <Text className="mt-3 text-lg font-bold text-white">{value}</Text>
  </View>
);

type FactBlockProps = {
  label: string;
  value: string;
};

const FactBlock = ({ label, value }: FactBlockProps) => (
  <View className="mb-3 w-[48%] rounded-[24px] border border-[black] bg-[#050518] p-4">
    <Text className="text-xs font-medium uppercase text-light-200">{label}</Text>
    <Text className="mt-2 text-sm font-semibold leading-6 text-white">
      {value}
    </Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const movieId = Array.isArray(id) ? id[0] : id;
  const { isMovieSaved, toggleSavedMovie } = useMovieLibrary();

  const {
    data: movie,
    loading,
    error,
    refetch,
  } = useFetch(() => fetchMovieDetails(movieId ?? ""));

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <StatusBar style="light" />
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color="#D6C7FF" />
          <Text className="mt-4 text-sm font-semibold text-light-100">
            Loading movie dossier...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !movie) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <StatusBar style="light" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-white">
            Movie details unavailable
          </Text>
          <Text className="mt-3 text-center text-sm leading-6 text-light-100">
            {error?.message ?? "We could not load this movie right now."}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            className="mt-8 w-full rounded-[22px] bg-accent py-4"
            onPress={refetch}
          >
            <Text className="text-center text-base font-semibold text-white">
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            className="mt-3 w-full rounded-[22px] border border-[black] bg-[#050518] py-4"
            onPress={router.back}
          >
            <Text className="text-center text-base font-semibold text-light-100">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const posterUri = buildImageUri(movie.poster_path, "w500", POSTER_FALLBACK);
  const backdropUri = buildImageUri(
    movie.backdrop_path ?? movie.poster_path,
    "w780",
    BACKDROP_FALLBACK
  );
  const releaseYear = movie.release_date?.split("-")[0] || "TBA";
  const genreNames = movie.genres.map(({ name }) => name);
  const spokenLanguages = movie.spoken_languages.map(
    ({ english_name, name }) => english_name || name
  );
  const countryNames = movie.production_countries.map(({ name }) => name);
  const companyNames = movie.production_companies.map(({ name }) => name);
  const movieIsSaved = isMovieSaved(movie.id);

  const handleOpenHomepage = () => {
    if (!movie.homepage) {
      return;
    }

    void Linking.openURL(movie.homepage);
  };

  const handleToggleSave = () => {
    toggleSavedMovie(movie);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar style="light" />

      <View className="flex-1 bg-primary">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <ImageBackground
            source={{ uri: backdropUri }}
            style={styles.hero}
            imageStyle={styles.heroImage}
          >
            <View style={styles.heroScrim} />
            <View style={styles.heroGlow} />

            <View className="px-5 pt-3">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  activeOpacity={0.85}
                  className="size-11 items-center justify-center rounded-full border border-[black] bg-[#050518]"
                  onPress={router.back}
                >
                  <Image
                    source={icons.arrow}
                    className="size-5 rotate-180"
                    tintColor="#FFFFFF"
                  />
                </TouchableOpacity>

                <View className="-skew-x-12 slan border border-[black] bg-[#050518] px-4 py-2">
                  <Text style={styles.eyebrow}>
                    {movie.adult ? "18+ release" : "feature release"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-auto px-5 pb-24">
              <Text style={styles.eyebrow}>Feature file</Text>
              <Text className="mt-3 text-4xl font-black text-white">
                {movie.title}
              </Text>
              <Text className="mt-3 text-base leading-6 text-light-100">
                {movie.tagline || "No official tagline available."}
              </Text>
            </View>
          </ImageBackground>

          <View className="-mt-20 px-5">
            <View
              className="rounded-[32px] border border-[black] bg-[#050518] p-4"
              style={styles.shellCard}
            >
              <View className="flex-row">
                <Image
                  source={{ uri: posterUri }}
                  className="h-52 w-36 rounded-[24px]"
                  resizeMode="cover"
                />

                <View className="ml-4 flex-1">
                  <Text style={styles.eyebrow}>{releaseYear} release</Text>
                  <Text className="mt-2 text-[26px] font-bold text-white">
                    {movie.title}
                  </Text>

                  <View className="mt-2 flex-row flex-wrap">
                    <MovieChip label={formatRuntime(movie.runtime)} />
                    <MovieChip label={movie.original_language.toUpperCase()} />
                    <MovieChip label={movie.status} />

                    <TouchableOpacity
              activeOpacity={0.85}
              className={`mr-3 mb-0 flex-row items-center justify-center -skew-x-12 slan border py-4 ${
                movieIsSaved
                  ? "border-[#243B86] bg-secondary"
                  : "border-[black] bg-[#07122F]"
              }`}
              style={styles.saveflexButton}
              onPress={handleToggleSave}
            >
              <Image
                source={icons.save}
                style={styles.actionIcon}
                tintColor={movieIsSaved ? "#FFFFFF" : "#A8B5DB"}
                resizeMode="contain"
              />
              <Text
                className={`ml-2 text-base font-semibold ${
                  movieIsSaved ? "text-white" : "text-light-100"
                }`}
              >
                {movieIsSaved ? "Saved" : "Save"}
              </Text>
            </TouchableOpacity>

                  </View>

                  <View className="mt-4 rounded-[22px] border border-[black] bg-[#02020e] p-4">
                    <View className="flex-row items-center">
                      <View className="h-2 w-2 items-center justify-center rounded-full bg-[#02020e]">
                        <Image
                          source={icons.stars}
                          style={styles.ratingStarsIcon}
                          resizeMode="contain"
                        />
                      </View>

                      <View className="ml-3 flex-1">
                        <Text className="text-lg font-bold text-white">
                          {formatVoteAverage(movie.vote_average)}/10
                        </Text>
                        <Text className="text-xs text-light-200">
                          {movie.vote_count.toLocaleString()} audience votes
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text style={styles.eyebrow}>Popularity</Text>
                        <Text className="mt-1 text-sm font-semibold text-white">
                          {Math.round(movie.popularity)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-6 px-5">
            <View className="flex-row flex-wrap">
              {genreNames.length ? (
                genreNames.map((genre) => <MovieChip key={genre} label={genre} />)
              ) : (
                <MovieChip label="Genre pending" />
              )}
            </View>

            <SectionCard eyebrow="Storyline" title="The pitch">
              <Text className="text-sm leading-7 text-light-100">
                {movie.overview || "No synopsis is available for this title yet."}
              </Text>
            </SectionCard>

            <SectionCard eyebrow="Numbers" title="Release pulse">
              <View className="flex-row flex-wrap justify-between">
                <StatTile
                  label="Budget"
                  value={formatCompactCurrency(movie.budget)}
                />
                <StatTile
                  label="Revenue"
                  value={formatCompactCurrency(movie.revenue)}
                />
                <StatTile
                  label="Votes"
                  value={movie.vote_count.toLocaleString()}
                />
                <StatTile
                  label="Collection"
                  value={movie.belongs_to_collection ? "Yes" : "No"}
                />
              </View>
            </SectionCard>

            <SectionCard eyebrow="Identity" title="Production notes">
              <View className="flex-row flex-wrap justify-between">
                <FactBlock label="Original title" value={movie.original_title} />
                <FactBlock label="Languages" value={joinList(spokenLanguages)} />
                <FactBlock label="Countries" value={joinList(countryNames)} />
                <FactBlock
                  label="Collection"
                  value={
                    movie.belongs_to_collection?.name || "Standalone release"
                  }
                />
              </View>
            </SectionCard>

            <SectionCard eyebrow="Studios" title="Built by">
              <View className="flex-row flex-wrap">
                {companyNames.length ? (
                  companyNames.map((company) => (
                    <MovieChip key={company} label={company} />
                  ))
                ) : (
                  <Text className="text-sm leading-6 text-light-100">
                    Production company details have not been listed for this movie.
                  </Text>
                )}
              </View>
            </SectionCard>
          </View>
        </ScrollView>

        <View
          className="absolute bottom-5 left-5 right-5 rounded-[28px] border border-[black] bg-[#050518] p-3"
          style={styles.actionBar}
        >
          <View className="flex-row">
            {movie.homepage ? (
              <TouchableOpacity
                activeOpacity={0.85}
                className="mr-3 flex-1 items-center justify-center rounded-[20px] border border-[black] bg-[#07122F] py-4"
                onPress={handleOpenHomepage}
              >
                <Text className="text-base font-semibold text-light-100">
                  Website
                </Text>
              </TouchableOpacity>
            ) : null}

            
            <TouchableOpacity
              activeOpacity={0.85}
              className="flex-row items-center justify-center rounded-[20px] bg-accent py-4"
              style={styles.flexButton}
              onPress={router.back}
            >
              <Image
                source={icons.arrow}
                className="mr-2 size-5 rotate-180"
                tintColor="#FFFFFF"
              />
              <Text className="text-base font-semibold text-white">Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionBar: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 22,
  },
  contentContainer: {
    paddingBottom: 140,
  },
  actionIcon: {
    width: 18,
    height: 18,
  },
  eyebrow: {
    color: "#A8B5DB",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  flexButton: {
    flex: 1,
  },
  saveflexButton: {
    height: 10,
    marginBottom: -20,
    flex: 0.3,},
  hero: {
    height: 420,
    justifyContent: "space-between",
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 3, 13, 0.4)",
  },
  heroImage: {
    opacity: 0.95,
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 3, 13, 0.58)",
  },
  shellCard: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 18,
  },
  ratingStarsIcon: {
    width: 20,
    height: 20,
  },
});

export default Details;


