import React, {FunctionComponent, useCallback, useMemo} from "react";
import {
  Platform,
  StyleSheet,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import SliderNativeComponent, {
  type NativeSliderProps,
  type SliderChangeEvent,
} from "./SliderNativeComponent";

export type SliderProps = {
  style?: StyleProp<ViewStyle>;
  onValueChange?: (value: number) => void;
} & NativeSliderProps;

export const Slider: FunctionComponent<SliderProps> = ({
  minValue,
  maxValue,
  step,
  onValueChange,
  style,
}) => {
  const steps = useMemo(() => {
    if (!step) {
      return undefined;
    } else {
      return Platform.OS === "android"
        ? Math.round(Math.abs(((maxValue || 1) - (minValue || 0)) / step)) - 1
        : step;
    }
  }, [minValue, maxValue, step]);

  const handleValueChange = useCallback(
    (event: NativeSyntheticEvent<SliderChangeEvent>) => {
      onValueChange?.(event.nativeEvent.value);
    },
    [onValueChange],
  );

  return (
    <SliderNativeComponent
      onValueChange={handleValueChange}
      style={[styles.base, style]}
      minValue={minValue}
      maxValue={maxValue}
      step={steps}
    />
  );
};

export default Slider;

const styles = StyleSheet.create({
  base: {
    minHeight: 40,
  },
});
