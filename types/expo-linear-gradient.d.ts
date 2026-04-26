declare module "expo-linear-gradient" {
  import { ComponentType } from "react";
  import { ColorValue, ViewProps } from "react-native";

  type LinearGradientPoint = {
    x: number;
    y: number;
  };

  export interface LinearGradientProps extends ViewProps {
    colors: readonly ColorValue[];
    locations?: readonly number[];
    start?: LinearGradientPoint | null;
    end?: LinearGradientPoint | null;
    dither?: boolean;
  }

  export const LinearGradient: ComponentType<LinearGradientProps>;
}
