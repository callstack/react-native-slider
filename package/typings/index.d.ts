import * as React from 'react';
import * as ReactNative from 'react-native';

export interface SliderProps extends ReactNative.ViewProps {
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
}

/**
 * A component used to select a single value, or a span of values, from a range
 * of values.
 */
declare function Slider(props: SliderProps): React.ReactNode;
export default Slider;
