import { useRef } from "react";
import { Link } from "expo-router";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { icons } from "@/constants/icons";

type MovieCardProps = {
  id: number;
  poster_path: string | null;
  title: string;
  vote_average: number;
  release_date: string;
};

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
}: MovieCardProps) => {
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const releaseYear = release_date?.split("-")[0] || "TBA";

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
    <Link href={`/movie/${id}` as any} asChild>
      <Pressable
        style={styles.pressable}
        onHoverIn={() => animateCard(1)}
        onHoverOut={() => animateCard(0)}
        onPressIn={() => animateCard(1)}
        onPressOut={() => animateCard(0)}
      >
        <Animated.View style={[styles.cardShadow, animatedCardStyle]}>
          <View className="overflow-hidden rounded-[24px] ">
            <View className="absolute right-3 top-3 z-20 flex-row items-center -skew-x-12 slan  bg-[#041129]/90 px-2.5 py-1.5">
              <Image source={icons.stars} style={styles.ratingIcon} />
              <Text className="ml-1 text-[11px] font-bold text-white ">
                {(vote_average / 2).toFixed(1)}
              </Text>
            </View>

            <View className="relative">
              <Image
                source={{
                  uri: poster_path
                    ? `https://image.tmdb.org/t/p/w500${poster_path}`
                    : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
                }}
                className="h-52 w-full"
                resizeMode="cover"
              />

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

              <View className="absolute inset-x-0 bottom-0 h-20 bg-[#02050E]/75" />
            </View>

            <View className="p-3">
              <Text
                className="min-h-[40px] text-sm font-bold text-gray-300"
                numberOfLines={2}
              >
                {title}
              </Text>

              <View className="mt-3 flex-row items-center justify-between">
                <View className="-skew-x-12   bg-[#091633] px-3 py-1">
                  <Text className="text-[11px] font-semibold text-light-100">
                    {releaseYear}
                  </Text>
                </View>

                <Text className="text-[11px] font-semibold uppercase text-light-200">
                  Movie
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Link>
  );
};

export default MovieCard;

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 10,
  },
  hoverGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 110,
    backgroundColor: "rgba(214, 199, 255, 0.18)",
  },
  pressable: {
    width: "30.6%",
  },
  ratingIcon: {
    width: 14,
    height: 14,
  },
});
