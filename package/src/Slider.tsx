import React, {useState} from 'react';
import type {FC} from 'react';
import {View} from 'react-native';
import type {
  ColorValue,
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

export type ThumbProps = {
  /**
   * Contains the exact step number on which this custom Thumb currently is.
   *
   * Steps are counted from `minimumValue`, which is step 0.
   * A slider with no `step` has no steps to count, and reports 0.
   */
  index: number;
};

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

    /**
     * Used to pass a custom component rendered as a thumb of the Slider.
     */
    thumb?: FC<ThumbProps>;

    /**
     * Defines the color the track from minimumValue to thumb, or left thumb (when ranged) will be.
     */
    minimumTrackColor?: ColorValue;

    /**
     * Defines the color the track from left thumb to right thumb (when ranged) will be.
     */
    middleRangeTrackColor?: ColorValue;

    /**
     * Defines the color the track from thumb, or right thumb (when ranged) to maximumValue will be.
     */
    maximumTrackColor?: ColorValue;
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

const stepIndex = (
  value: number,
  minimumValue: number,
  maximumValue: number,
  step: number,
) => {
  if (step <= 0) {
    return 0;
  }

  const clamped = Math.min(
    Math.max(value, minimumValue),
    Math.max(maximumValue, minimumValue),
  );

  return Math.round((clamped - minimumValue) / step);
};

const useThumbValue = (value: number) => {
  const [dispatched, setDispatched] = useState({given: value, value});
  const current = dispatched.given === value ? dispatched.value : value;

  return [
    current,
    (newValue: number) => setDispatched({given: value, value: newValue}),
  ] as const;
};

const thumbValueHandler =
  (callback: (value: number) => void, onChange?: (value: number) => void) =>
  (value: number) => {
    callback(value);
    onChange?.(value);
  };

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
  thumb: Thumb,
  ...props
}: SliderProps) => {
  const [currentValue, setCurrentValue] = useThumbValue(value);
  const [currentValueLeft, setCurrentValueLeft] = useThumbValue(valueLeft);
  const [currentValueRight, setCurrentValueRight] = useThumbValue(valueRight);

  const handleValueChange = Thumb
    ? thumbValueHandler(setCurrentValue, onValueChange)
    : onValueChange;
  const handleLeftValueChange = Thumb
    ? thumbValueHandler(setCurrentValueLeft, onLeftValueChange)
    : onLeftValueChange;
  const handleRightValueChange = Thumb
    ? thumbValueHandler(setCurrentValueRight, onRightValueChange)
    : onRightValueChange;

  const thumbValues = ranged
    ? [currentValueLeft, currentValueRight]
    : [currentValue];

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
      onValueChange={valueHandler(handleValueChange)}
      onLeftValueChange={valueHandler(handleLeftValueChange)}
      onRightValueChange={valueHandler(handleRightValueChange)}>
      {Thumb ? 
        thumbValues.map((thumbValue, thumbIndex) => (
          <View key={thumbIndex} collapsable={false} pointerEvents="none">
            <Thumb
              index={stepIndex(thumbValue, minimumValue, maximumValue, step)}
            />
          </View>
        )) : null}
    </RNCSliderNativeComponent>
  );
};

export default Slider;
