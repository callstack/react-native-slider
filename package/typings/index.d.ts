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
   */
  value?: number;

  /**
   * Callback continuously called while the user is dragging the slider.
   */
  onValueChange?: (value: number) => void;
}

/**
 * A component used to select a single value from a range of values.
 */
declare function Slider(props: SliderProps): React.ReactNode;
export default Slider;
