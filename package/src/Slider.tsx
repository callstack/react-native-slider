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
     *
     * Ignored by a ranged slider, which is positioned by `valueLeft` and
     * `valueRight` instead.
     */
    value?: number;

    /**
     * Whether the slider selects a span of its range with two thumbs, rather
     * than a single value with one. Default value is false.
     *
     * Supported on iOS.
     */
    ranged?: boolean;

    /**
     * Value of the thumb bounding the selected span from below. Defaults to
     * `minimumValue`.
     *
     * Behaves like `value`, and is only used by a ranged slider. The thumb
     * cannot be dragged past `valueRight`.
     */
    valueLeft?: number;

    /**
     * Value of the thumb bounding the selected span from above. Defaults to
     * `maximumValue`.
     *
     * Behaves like `value`, and is only used by a ranged slider. The thumb
     * cannot be dragged past `valueLeft`.
     */
    valueRight?: number;

    /**
     * Step defines the granularity of the slider. The value of the slider will always be a multiple of the step value.
     * This works for both single and ranged sliders in the same manner.
     * The default value is 0, which means no step.
     */
    step?: number;

    /**
     * Callback continuously called while the user is dragging the slider.
     */
    onValueChange?: (value: number) => void;

    /**
     * Callback continuously called while the user is dragging the lower thumb
     * of a ranged slider.
     */
    onLeftValueChange?: (value: number) => void;

    /**
     * Callback continuously called while the user is dragging the upper thumb
     * of a ranged slider.
     */
    onRightValueChange?: (value: number) => void;
  }>;

/**
 * Unwraps the value out of a native event, for a handler that only cares about
 * the value. A slider with no handler for an event must not pass one down
 * either, so that the native side can leave the event unsent.
 */
const valueHandler = (onChange?: (value: number) => void) =>
  onChange
    ? (event: SliderValueChangeEvent) => onChange(event.nativeEvent.value)
    : undefined;

const Slider = ({
  minimumValue = 0,
  maximumValue = 1,
  value = 0,
  ranged = false,
  valueLeft = minimumValue,
  valueRight = maximumValue,
  step = 0,
  onValueChange,
  onLeftValueChange,
  onRightValueChange,
  ...props
}: SliderProps) => {
  return (
    <RNCSliderNativeComponent
      {...props}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      value={value}
      ranged={ranged}
      valueLeft={valueLeft}
      valueRight={valueRight}
      step={step}
      onValueChange={valueHandler(onValueChange)}
      onLeftValueChange={valueHandler(onLeftValueChange)}
      onRightValueChange={valueHandler(onRightValueChange)}
    />
  );
};

export default Slider;
