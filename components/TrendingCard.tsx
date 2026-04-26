import { Link } from "expo-router";
import MaskedView from "@react-native-masked-view/masked-view";
import { useRef } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { images } from "@/constants/images";

const TrendingCard = ({
  movie: { movie_id, title, poster_url },
  index,
}: TrendingCardProps) => {
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const rankNumber = `${index + 1}`.padStart(2, "0");

  const animateCard = (toValue: number) => {
    Animated.spring(hoverAnim, {
      toValue,
      friction: 8,
      tension: 90,
      useNativeDriver: true,
    }).start();
  };

  const animatedCardStyle = {
    transform: [
      {
        translateY: hoverAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
      {
        scale: hoverAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.03],
        }),
      },
    ],
  };

  return (
    <Link href={`/movie/${movie_id}` as any} asChild>
      <Pressable
        style={styles.pressable}
        onHoverIn={() => animateCard(1)}
        onHoverOut={() => animateCard(0)}
        onPressIn={() => animateCard(1)}
        onPressOut={() => animateCard(0)}
      >
        <Animated.View style={[styles.cardShadow, animatedCardStyle]}>
          <ImageBackground
            source={poster_url ? { uri: poster_url } : images.bg}
            resizeMode="cover"
            style={styles.card}
            imageStyle={styles.posterImage}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.hoverGlow,
                {
                  opacity: hoverAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            />

            <View style={styles.posterShade} />

            <View style={styles.bottomPanel}>
              <MaskedView
                style={styles.rankMask}
                maskElement={
                  <View style={styles.rankMaskElement}>
                    <Text style={styles.rankText}>#{rankNumber}</Text>
                  </View>
                }
              >
                <View style={styles.rankFill}>
                  <Image className="bg-[gray]"
                    source={images.rankingGradient}
                    resizeMode="stretch"
                    style={styles.rankGradient}
                  />
                </View>
              </MaskedView>
            </View>
          </ImageBackground>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </Animated.View>
      </Pressable>
    </Link>
  );
};

export default TrendingCard;

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 10,
  },
  pressable: {
    width: 228,
  },
  card: {
    height: 360,
    justifyContent: "flex-end",
    overflow: "hidden",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#19305F",
    backgroundColor: "#02020E",
  },
  posterImage: {
    borderRadius: 30,
  },
  hoverGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 160,
    backgroundColor: "rgba(214, 199, 255, 0.16)",
  },
  posterShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 5, 14, 0.24)",
  },
  bottomPanel: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "rgba(4, 9, 20, 0.54)",
  },
  title: {
    flex: 1,
    paddingRight: 18,
    marginTop: 8,
    color: "#DCE0FF",
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 24,
  },
  rankMask: {
    width: 108,
    height: 58,
  },
  rankMaskElement: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  rankText: {
  
    fontSize: 42,
    fontWeight: "900",
    fontFamily: "Inter-Black",
    lineHeight: 42,
    letterSpacing: -1.4,
    color: "gray",
  },
  rankFill: {
    flex: 1,
    backgroundColor: "#BBC0C8",
  },
  rankGradient: {
    width: "100%",
    height: "100%",
    opacity: 0.96,
  },
});
