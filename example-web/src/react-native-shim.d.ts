declare module "react-native" {
  import type * as React from "react";

  export type AccessibilityActionEvent = any;
  export type ColorValue = string;
  export type GestureResponderEvent = any;
  export type HostComponent<P> = React.ComponentType<P>;
  export type ImageSource = any;
  export type ImageSourcePropType = any;
  export type ImageStyle = Record<string, any>;
  export type LayoutChangeEvent = {
    nativeEvent: {
      layout: {
        width: number;
        height: number;
        x: number;
        y: number;
      };
    };
  };
  export type NativeSyntheticEvent<T> = {nativeEvent: T};
  export type StyleProp<T> = T | T[] | null | undefined;
  export type TextStyle = Record<string, any>;
  export type ViewProps = Record<string, any>;
  export type ViewStyle = Record<string, any>;

  export const Image: any;
  export const Platform: {
    OS: string;
    select<T>(options: Record<string, T>): T;
  };
  export const Pressable: any;
  export const ScrollView: any;
  export const StyleSheet: any;
  export const Text: any;
  export const View: any;
}

declare module "react-native/Libraries/Image/ImageSource" {
  export type ImageSource = any;
}

declare module "react-native/Libraries/Types/CodegenTypes" {
  export type DirectEventHandler<T> = (event: {nativeEvent: T}) => void;
  export type Double = number;
  export type Float = number;
  export type WithDefault<T, _Default> = T;
}

declare module "react-native/Libraries/Utilities/codegenNativeComponent" {
  import type {HostComponent} from "react-native";

  export default function codegenNativeComponent<P>(
    componentName: string,
  ): HostComponent<P>;
}

declare module "@react-native-community/slider" {
  import type * as React from "react";
  import type {ViewProps} from "react-native";

  export type MarkerProps = {
    stepMarked: boolean;
    currentValue: number;
    index: number;
    min: number;
    max: number;
  };

  export type SliderProps = ViewProps &
    Readonly<{
      [key: string]: any;
      onSlidingComplete?: (value: number) => void;
      onSlidingStart?: (value: number) => void;
      onValueChange?: (value: number) => void;
      StepMarker?: React.FC<MarkerProps>;
      renderStepNumber?: boolean;
    }>;

  const Slider: React.ForwardRefExoticComponent<SliderProps>;
  export default Slider;
}
