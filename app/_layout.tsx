import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import { MovieLibraryProvider } from "@/context/MovieLibraryContext";
import "./globals.css";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void SplashScreen.hideAsync();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <MovieLibraryProvider>
      <StatusBar hidden={true} />

      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="movie/[id]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </MovieLibraryProvider>
  );
}
