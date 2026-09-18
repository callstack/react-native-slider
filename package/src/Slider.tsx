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
     * Limits the avaiable range of the slider to the lower value;
     * Slider's thumb can't go below this value, but the track is still rendered below it to the minimumValue.
     * Dragging events will not be emitted when the user's dragging is below this value.
     * If the lowerLimit is greater than the upperLimit, the lowerLimit will be ignored.
     * If the lowerLimit is lower than the minimumValue, the lowerLimit will be ignored.
     */
    lowerLimit?: number;

    /**
     * Limits the avaiable range of the slider to the upper value;
     * Slider's thumb can't go above this value, but the track is still rendered above it to the maximumValue.
     * Dragging events will not be emitted when the user's dragging is above this value.
     * If the upperLimit is lower than the lowerLimit, the upperLimit will be ignored.
     * If the upperLimit is greater than the maximumValue, the upperLimit will be ignored.
     */
    upperLimit?: number;

    /**
     * The orientation of Slider.
     * Default is "horizontal".
     * Switches the way how Slider is displayed.
     *
     * A vertical slider holds its `minimumValue` at the bottom and its
     * `maximumValue` at the top, and is dragged up and down. Everything else -
     * the range, the step, the limits, the second thumb of a ranged slider and
     * the events all of them report - behaves exactly as it does horizontally.
     */
    orientation?: 'horizontal' | 'vertical';

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

    /**
     * Callback called each time user starts dragging.
     * The event is fired as soon as user holds (long press) any thumb (left or right),
     * regardless if the drag changed the value or not.
     */
    onSlidingStart?: () => void;

    /**
     * Callback called each time user ends dragging.
     * The event is fired as soon as user releases any thumb (left or right) after long press,
     * regardless if the drag changed the value or not.
     */
    onSlidingComplete?: () => void;
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
  lowerLimit = minimumValue,
  upperLimit = maximumValue,
  orientation = 'horizontal',
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
      lowerLimit={lowerLimit}
      upperLimit={upperLimit}
      orientation={orientation}
      onValueChange={valueHandler(onValueChange)}
      onLeftValueChange={valueHandler(onLeftValueChange)}
      onRightValueChange={valueHandler(onRightValueChange)}
    />
  );
};

export default Slider;
