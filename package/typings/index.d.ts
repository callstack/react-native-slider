import * as React from 'react';
import { FC } from 'react';
import { ColorValue, ViewProps } from 'react-native';

export type ThumbProps = {
  /**
   * Contains the exact step number on which this custom Thumb currently is.
   */
  index: number
}

export type TrackProps = {}

export interface SliderProps extends ViewProps {
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
   * Limits the avaiable range of the slider to the lower value;
   * 
   */
  lowerLimit?: number;

  /**
   * Limits the avaiable range of the slider to the upper value;
   */
  upperLimit?: number;

  /**
   * Step defines the granularity of the slider. The value of the slider will always be a multiple of the step value.
   * This works for both single and ranged sliders in the same manner.
   * The default value is 0, which means no step.
   */
  step?: number;

  /**
   * The orientation of Slider.
   * Default is "horizontal".
   * Switches the way how Slider is displayed.
   */
  orientation?: "horizontal" | "vertical";

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

  /**
   * Replaces the default (native) track with the given component.
   * The component will be spread along the whole track by it's X-axis,
   * meaning that:
   *  * In horizontal Slider, the width of given component will be increased to the width of the track,
   *  * In vertical Slider, the width of given component will be increased as well, but the component will
   *    be transformed in the same 90 degree as vertical Slider is.
   * NOTE, that the custom track component takes the priority against
   * the minimumTrackColor, middleRangeTrackColor and maximumTrackColor.
   */
  track?: FC<TrackProps>;
}

/**
 * A component used to select a single value, or a span of values, from a range
 * of values.
 */
declare function Slider(props: SliderProps): React.ReactNode;
export default Slider;
