import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import useFetch from "@/services/usefetch";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

import MovieCard from "@/components/MovieCard";
import TrendingCard from "@/components/TrendingCard";

type HeroButtonProps = {
  label: string;
  icon: any;
  variant: "primary" | "secondary";
  onPress: () => void;
};

const HeroButton = ({ label, icon, variant, onPress }: HeroButtonProps) => {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      style={[styles.heroButton, isPrimary ? styles.heroButtonPrimary : styles.heroButtonSecondary]}
    >
      <Image
        source={icon}
        resizeMode="contain"
        style={[
          styles.heroButtonIcon,
          isPrimary ? styles.heroButtonIconPrimary : styles.heroButtonIconSecondary,
        ]}
      />
      <Text
        style={[
          styles.heroButtonLabel,
          isPrimary ? styles.heroButtonLabelPrimary : styles.heroButtonLabelSecondary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

type ShelfHeaderProps = {
  title: string;
  subtitle: string;
  count?: string;
};

const ShelfHeader = ({ title, subtitle, count }: ShelfHeaderProps) => (
  <View style={styles.shelfHeader}>
    <View style={styles.shelfHeaderCopy}>
      <View style={styles.shelfMarker} />
      <View style={styles.shelfHeaderTextWrap}>
        <Text style={styles.shelfTitle}>{title}</Text>
        <Text style={styles.shelfSubtitle}>{subtitle}</Text>
      </View>
    </View>

    {count ? (
      <View style={styles.countPill}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    ) : null}
  </View>
);

type PosterStripCardProps = {
  movie: Movie;
  onPress: () => void;
};

const PosterStripCard = ({ movie, onPress }: PosterStripCardProps) => {
  const posterSource = movie.poster_path
    ? { uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }
    : images.bg;
  const releaseYear = movie.release_date?.split("-")[0] || "New";

  return (
    <Pressable onPress={onPress} style={styles.posterStripPressable}>
      <ImageBackground
        source={posterSource}
        resizeMode="cover"
        style={styles.posterStrip}
        imageStyle={styles.posterStripImage}
      >
        <View style={styles.posterStripShade} />
        <View style={styles.posterStripFooter}>
          <Text style={styles.posterStripYear}>{releaseYear}</Text>
          <Text style={styles.posterStripTitle} numberOfLines={2}>
            {movie.title}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const Index = () => {
  const router = useRouter();

  const {
    data: trendingMoviesData,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);
  const trendingMovies = trendingMoviesData ?? [];

  const {
    data: moviesData,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }));
  const movies = moviesData ?? [];

  const featuredMovie = movies[0];
  const featuredBackdrop = featuredMovie?.backdrop_path
    ? {
        uri: `https://image.tmdb.org/t/p/w780${featuredMovie.backdrop_path}`,
      }
    : images.bg;
  const featuredTitle = featuredMovie?.title || "ViewNet Originals";
  const featuredDescription =
    featuredMovie?.overview ||
    "A darker home feed for late-night browsing, big premieres, and fast picks.";
  const featuredYear = featuredMovie?.release_date?.split("-")[0] || "Now";
  const featuredScore = featuredMovie
    ? `${(featuredMovie.vote_average / 2).toFixed(1)} rating`
    : "Editor pick";
  const featuredLabel = trendingMovies.length > 0 ? "Top picks tonight" : "Streaming now";

  const spotlightMovies = movies.length > 6 ? movies.slice(1, 7) : movies.slice(0, 6);
  const gridMovies = movies.length > 12 ? movies.slice(1, 13) : movies.slice(0, 12);

  const openFeaturedMovie = () => {
    if (featuredMovie) {
      router.push(`/movie/${featuredMovie.id}` as any);
      return;
    }

    router.push("./search");
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {moviesLoading || trendingLoading ? (
          <View style={styles.stateWrap}>
            <Image source={icons.logo} style={styles.stateLogo} resizeMode="contain" />
            <ActivityIndicator size="large" color="#d5cefd" style={styles.stateSpinner} />
            <Text style={styles.stateTitle}>Loading your stream</Text>
            <Text style={styles.stateBody}>
              Pulling in trending titles and the latest arrivals.
            </Text>
          </View>
        ) : moviesError || trendingError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorEyebrow}>Home</Text>
            <Text style={styles.errorTitle}>This row is unavailable</Text>
            <Text style={styles.errorBody}>
              {moviesError?.message || trendingError?.message}
            </Text>
          </View>
        ) : (
          <>
            <ImageBackground
              source={featuredBackdrop}
              resizeMode="cover"
              style={styles.hero}
              imageStyle={styles.heroImage}
            >
              <View style={styles.heroBackdrop} />
              <View style={styles.heroTopShade} />
              <View style={styles.heroBottomShade} />

              <View style={styles.heroContent}>
                <View style={styles.navRow}>
                  <View style={styles.brandRow}>
                    <Image source={icons.logo} style={styles.brandLogo} resizeMode="contain" />
                    
                  </View>

                  <View style={styles.navLinks}>
                    <Text style={styles.navLink}>Series</Text>
                    <Text style={styles.navLink}>Movies</Text>
                    <Pressable
                      style={styles.navIconButton}
                      onPress={() => router.push("./search")}
                    >
                      <Image
                        source={icons.search}
                        style={styles.navIcon}
                        tintColor="#FFFFFF"
                        resizeMode="contain"
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.heroBody}>
                  <Text style={styles.heroEyebrow}>{featuredLabel}</Text>
                  <Text style={styles.heroTitle} numberOfLines={2}>
                    {featuredTitle}
                  </Text>

                  <View style={styles.heroMetaRow}>
                    <View style={[styles.metaPill, styles.metaPillAccent]}>
                      <Text style={[styles.metaPillText, styles.metaPillTextAccent]}>
                        98% Match
                      </Text>
                    </View>
                    <View style={styles.metaPill}>
                      <Text style={styles.metaPillText}>{featuredYear}</Text>
                    </View>
                    <View style={styles.metaPill}>
                      <Text style={styles.metaPillText}>{featuredScore}</Text>
                    </View>
                  </View>

                  <Text style={styles.heroDescription} numberOfLines={4}>
                    {featuredDescription}
                  </Text>

                  <View style={styles.heroActionRow}>
                    <HeroButton
                      label="Play"
                      icon={icons.play}
                      variant="primary"
                      onPress={openFeaturedMovie}
                    />
                    <HeroButton
                      label="Search"
                      icon={icons.search}
                      variant="secondary"
                      onPress={() => router.push("./search")}
                    />
                    <HeroButton
                      label="My List"
                      icon={icons.save}
                      variant="secondary"
                      onPress={() => router.push("./save")}
                    />
                  </View>
                </View>
              </View>
            </ImageBackground>

            <View style={styles.shelf}>
              <ShelfHeader
                title="Top 10 Right Now"
                subtitle="Trending titles ranked for tonight's binge."
                count={`${trendingMovies.length} titles`}
              />

              {trendingMovies.length > 0 ? (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={trendingMovies}
                  contentContainerStyle={styles.horizontalListContent}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item) => item.movie_id.toString()}
                  ItemSeparatorComponent={() => <View style={styles.horizontalGap} />}
                />
              ) : (
                <View style={styles.emptyShelf}>
                  <Text style={styles.emptyShelfText}>
                    Trending titles will show here when the feed updates.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.shelf}>
              <ShelfHeader
                title="New & Hot"
                subtitle="Fresh arrivals with the strongest first click."
              />

              {spotlightMovies.length > 0 ? (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={spotlightMovies}
                  contentContainerStyle={styles.horizontalListContent}
                  renderItem={({ item }) => (
                    <PosterStripCard
                      movie={item}
                      onPress={() => router.push(`/movie/${item.id}` as any)}
                    />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  ItemSeparatorComponent={() => <View style={styles.horizontalGap} />}
                />
              ) : (
                <View style={styles.emptyShelf}>
                  <Text style={styles.emptyShelfText}>
                    Fresh arrivals will appear here once titles are available.
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.shelf, styles.lastShelf]}>
              <ShelfHeader
                title="Popular on ViewNet"
                subtitle="A deeper row of recent releases to keep scrolling."
              />

              <FlatList
                data={gridMovies}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                scrollEnabled={false}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.gridContent}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#030207",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#02020e",
  },
  content: {
    paddingBottom: 48,
  },
  stateWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 180,
    paddingBottom: 120,
  },
  stateLogo: {
    width: 74,
    height: 74,
  },
  stateSpinner: {
    marginTop: 22,
  },
  stateTitle: {
    marginTop: 22,
    color: "#ebecfa",
    fontSize: 24,
    fontWeight: "800",
  },
  stateBody: {
    marginTop: 10,
    maxWidth: 280,
    color: "#B9BDC6",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  errorCard: {
    marginHorizontal: 20,
    marginTop: 140,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    backgroundColor: "#111111",
    padding: 24,
  },
  errorEyebrow: {
    color: "#e5091b",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  errorTitle: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  errorBody: {
    marginTop: 12,
    color: "#AEB3BC",
    fontSize: 14,
    lineHeight: 22,
  },
  hero: {
    minHeight: 660,
    justifyContent: "flex-end",
  },
  heroImage: {
    opacity: 0.94,
  },
  heroBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.34)",
  },
  heroTopShade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "rgba(0, 0, 0, 0.56)",
  },
  heroBottomShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 340,
    backgroundColor: "rgba(0, 0, 0, 0.82)",
  },
  heroContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 28,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandLogo: {
    width: 350,
    height: 350,
      position: "absolute",
  },
  // brandText: {
  //   marginLeft: 10,
  //   color: "#2c51f5",
  //   fontSize: 24,
  //   fontWeight: "900",
  //   letterSpacing: 1,
  // },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  navLink: {
    marginRight: 16,
    color: "#f4f4f4",
    fontSize: 14,
    fontWeight: "600",
  },
  navIconButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  navIcon: {
    width: 16,
    height: 16,
  },
  heroBody: {
    marginTop: 120,
  },
  heroEyebrow: {
    color: "#9ca0a7",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  heroTitle: {
    marginTop: 16,
    maxWidth: 300,
    color: "#dde1f7",
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 46,
  },
  heroMetaRow: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaPill: {
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  metaPillAccent: {
    backgroundColor: "rgba(53, 37, 126, 0.16)",
  },
  metaPillText: {
    color: "#d6d5e0",
    fontSize: 12,
    fontWeight: "700",
  },
  metaPillTextAccent: {
    color: "#acadb3",
  },
  heroDescription: {
    marginTop: 8,
    maxWidth: 320,
    color: "#e2e0f7",
    fontSize: 15,
    lineHeight: 24,
  },
  heroActionRow: {
    marginTop: 24,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  heroButton: {
    marginRight: 10,
    marginBottom: 10,
    minWidth: 112,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  heroButtonPrimary: {
    backgroundColor: "#6d6d6dad",
  },
  heroButtonSecondary: {
    backgroundColor: "rgba(109, 109, 110, 0.7)",
  },
  heroButtonIcon: {
    width: 13,
    height: 13,
  },
  heroButtonIconPrimary: {
    tintColor: "#f8f6f6",
  },
  heroButtonIconSecondary: {
    tintColor: "#e5e5fc",
  },
  heroButtonLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "800",
  },
  heroButtonLabelPrimary: {
    color: "#e4e4eb",
  },
  heroButtonLabelSecondary: {
    color: "#e2e7fc",
  },
  shelf: {
    marginTop: 26,
    paddingHorizontal: 20,
  },
  lastShelf: {
    paddingBottom: 12,
  },
  shelfHeader: {
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shelfHeaderCopy: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  shelfMarker: {
    marginTop: 6,
    width: 4,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#cbccce",
  },
  shelfHeaderTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  shelfTitle: {
    color: "#dfe7f8",
    fontSize: 24,
    fontWeight: "800",
  },
  shelfSubtitle: {
    marginTop: 4,
    color: "#e3e4e6",
    fontSize: 13,
    lineHeight: 20,
  },
  countPill: {
    marginLeft: 12,
    borderRadius: 999,
    backgroundColor: "#141414",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  countText: {
    color: "#D7DBE2",
    fontSize: 12,
    fontWeight: "700",
  },
  horizontalListContent: {
    paddingRight: 8,
  },
  horizontalGap: {
    width: 14,
  },
  emptyShelf: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#202020",
    backgroundColor: "#0F0F0F",
    padding: 18,
  },
  emptyShelfText: {
    color: "#A9ADB5",
    fontSize: 14,
    lineHeight: 22,
  },
  posterStripPressable: {
    width: 158,
  },
  posterStrip: {
    height: 228,
    justifyContent: "flex-end",
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: "#141414",
  },
  posterStripImage: {
    borderRadius: 18,
  },
  posterStripShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  posterStripFooter: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  posterStripYear: {
    color: "#C2C7D0",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  posterStripTitle: {
    marginTop: 6,
    color: "#e3e3ff",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 21,
  },
  gridRow: {
    justifyContent: "flex-start",
    gap: 14,
    paddingRight: 4,
    marginBottom: 16,
  },
  gridContent: {
    paddingBottom: 24,
  },
});
