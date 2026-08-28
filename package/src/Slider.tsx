import React from 'react';
import type {
  NativeSyntheticEvent,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native';
import RNCSliderNativeComponent from './index';

type SliderValueChangeEvent = NativeSyntheticEvent<
  Readonly<{
    value: number;
  }>
>;

export type SliderProps = ViewProps &
  Readonly<{
    /**
     * Used to style and layout the `Slider`.
     */
    style?: StyleProp<ViewStyle>;

    /**
     * Initial minimum value of the slider. Default value is 0.
     */
    minimumValue?: number;

    /**
     * Initial maximum value of the slider. Default value is 1.
     */
    maximumValue?: number;

    /**
     * Value of the slider. Can be used to programmatically control the
     * position of the thumb, and entered once at the beginning it acts as
     * the initial value.
     *
     * This is not a controlled component, you don't need to update the
     * value while the user is dragging.
     */
    value?: number;

    /**
     * Callback continuously called while the user is dragging the slider.
     */
    onValueChange?: (value: number) => void;
  }>;

const Slider = ({
  minimumValue = 0,
  maximumValue = 1,
  value = 0,
  onValueChange,
  ...props
}: SliderProps) => {
  const onValueChangeEvent = onValueChange
    ? (event: SliderValueChangeEvent) => {
        onValueChange(event.nativeEvent.value);
      }
    : undefined;

  return (
    <RNCSliderNativeComponent
      {...props}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      value={value}
      onValueChange={onValueChangeEvent}
    />
  );
};

export default Slider;
