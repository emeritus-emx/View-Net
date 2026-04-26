declare module "@react-native-masked-view/masked-view" {
  import { ComponentType, ReactElement } from "react";
  import { ViewProps } from "react-native";

  interface MaskedViewProps extends ViewProps {
    maskElement: ReactElement;
    androidRenderingMode?: "software" | "hardware";
  }

  const MaskedView: ComponentType<MaskedViewProps>;
  export default MaskedView;
}
