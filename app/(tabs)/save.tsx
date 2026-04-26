import type { ReactNode } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MovieCard from "@/components/MovieCard";
import { icons } from "@/constants/icons";
import { useMovieLibrary } from "@/context/MovieLibraryContext";

type LibrarySectionProps = {
  eyebrow: string;
  title: string;
  count: number;
  children: ReactNode;
};

const LibrarySection = ({
  eyebrow,
  title,
  count,
  children,
}: LibrarySectionProps) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.countPill}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>

    <View style={styles.sectionBody}>{children}</View>
  </View>
);

type EmptyStateProps = {
  title: string;
  body: string;
};

const EmptyState = ({ title, body }: EmptyStateProps) => (
  <View style={styles.emptyCard}>
    <View style={styles.emptyIconWrap}>
      <Image
        source={icons.save}
        style={styles.emptyIcon}
        tintColor="#DCE0FF"
        resizeMode="contain"
      />
    </View>

    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyBody}>{body}</Text>
  </View>
);

const Save = () => {
  const { savedMovies, downloadedMovies } = useMovieLibrary();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>My library</Text>
          <Text style={styles.heroTitle}>Saved and downloaded movies</Text>
          <Text style={styles.heroBody}>
            Save titles from the movie page and keep your library ready for your
            next watch.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatPill}>
              <Text style={styles.heroStatLabel}>Saved</Text>
              <Text style={styles.heroStatValue}>{savedMovies.length}</Text>
            </View>

            <View style={styles.heroStatPill}>
              <Text style={styles.heroStatLabel}>Downloaded</Text>
              <Text style={styles.heroStatValue}>{downloadedMovies.length}</Text>
            </View>
          </View>
        </View>

        <LibrarySection
          eyebrow="Saved"
          title="Your saved movies"
          count={savedMovies.length}
        >
          {savedMovies.length ? (
            <View style={styles.movieGrid}>
              {savedMovies.map((movie) => (
                <MovieCard key={movie.id} {...movie} />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No saved movies yet"
              body="Open a movie and tap Save to add it to this list."
            />
          )}
        </LibrarySection>

        <LibrarySection
          eyebrow="Downloaded"
          title="Offline-ready titles"
          count={downloadedMovies.length}
        >
          {downloadedMovies.length ? (
            <View style={styles.movieGrid}>
              {downloadedMovies.map((movie) => (
                <MovieCard key={`downloaded-${movie.id}`} {...movie} />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No downloaded movies yet"
              body="Downloaded movies will show up here once download support is connected."
            />
          )}
        </LibrarySection>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Save;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#030312",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 140,
  },
  heroCard: {
    borderWidth: 1,
   
    borderRadius: 30,
    padding: 22,
    backgroundColor: "#050518",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 18,
  },
  heroEyebrow: {
    color: "#A8B5DB",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroTitle: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  heroBody: {
    marginTop: 12,
    color: "#DCE0FF",
    fontSize: 14,
    lineHeight: 24,
  },
  heroStatsRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  heroStatPill: {
    flex: 0.3,
    marginRight: 12,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#090d30",
    paddingHorizontal: 16,
    paddingVertical: 14,
    
  },
  heroStatLabel: {
    color: "#A8B5DB",
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroStatValue: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  sectionCard: {
    marginTop: 20,
    borderRadius: 30,
    borderWidth: 1,
    backgroundColor: "#050518",
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionEyebrow: {
    color: "#A8B5DB",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionTitle: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  countPill: {
    minWidth: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#101A3E",
    backgroundColor: "#08122E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionBody: {
    marginTop: 18,
  },
  movieGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    
    backgroundColor: "#08122E",
    padding: 20,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10214F",
  },
  emptyIcon: {
    width: 24,
    height: 24,
  },
  emptyTitle: {
    marginTop: 16,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyBody: {
    marginTop: 8,
    color: "#DCE0FF",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
});
