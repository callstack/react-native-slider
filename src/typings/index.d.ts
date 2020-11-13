import * as React from "react";
import * as ReactNative from "react-native";

export interface SliderPropsAndroid extends ReactNative.ViewProps {
  /**
   * Color of the foreground switch grip.
   */
  thumbTintColor?: string;
}

export interface SliderRef {
  updateValue(value: number): void;
}

export interface SliderPropsIOS extends ReactNative.ViewProps {
  /**
   * Assigns a maximum track image. Only static images are supported.
   * The leftmost pixel of the image will be stretched to fill the track.
   */
  maximumTrackImage?: ReactNative.ImageURISource;

  /**
   * Assigns a minimum track image. Only static images are supported.
   * The rightmost pixel of the image will be stretched to fill the track.
   */
  minimumTrackImage?: ReactNative.ImageURISource;

  /**
   * Permits tapping on the slider track to set the thumb position.
   * Defaults to false on iOS. No effect on Android or Windows.
   */
  tapToSeek?: boolean;

  /**
   * Sets an image for the thumb. Only static images are supported.
   */
  thumbImage?: ReactNative.ImageURISource;

  /**
   * Assigns a single image for the track. Only static images
   * are supported. The center pixel of the image will be stretched
   * to fill the track.
   */
  trackImage?: ReactNative.ImageURISource;
}

export interface SliderPropsWindows extends ReactNative.ViewProps {
  /**
   * Controls the orientation of the slider, default value is 'false' (horizontal).
   */
  vertical?: boolean;
}


export interface SliderProps extends SliderPropsIOS, SliderPropsAndroid, SliderPropsWindows {
  /**
   * If true the user won't be able to move the slider.
   * Default value is false.
   */
  disabled?: boolean;

  /**
   * The color used for the track to the right of the button.
   * Overrides the default blue gradient image.
   */
  maximumTrackTintColor?: string;

  /**
   * Initial maximum value of the slider. Default value is 1.
   */
  maximumValue?: number;

  /**
   * The color used for the track to the left of the button.
   * Overrides the default blue gradient image.
   */
  minimumTrackTintColor?: string;

  /**
   * Initial minimum value of the slider. Default value is 0.
   */
  minimumValue?: number;

  /**
   * Callback that is called when the user picks up the slider.
   * The initial value is passed as an argument to the callback handler.
   */
  onSlidingStart?: (value: number) => void;

  /**
   * Callback called when the user finishes changing the value (e.g. when the slider is released).
   */
  onSlidingComplete?: (value: number) => void;

  /**
   * Callback continuously called while the user is dragging the slider.
   */
  onValueChange?: (value: number) => void;

  /**
   * Step value of the slider. The value should be between 0 and (maximumValue - minimumValue). Default value is 0.
   */
  step?: number;

  /**
   * Used to style and layout the Slider. See StyleSheet.js and ViewStylePropTypes.js for more info.
   */
  style?: ReactNative.StyleProp<ReactNative.ViewStyle>;

  /**
   * Used to locate this view in UI automation tests.
   */
  testID?: string;

  /**
   * Initial value of the slider. The value should be between minimumValue
   * and maximumValue, which default to 0 and 1 respectively.
   * Default value is 0.
   * This is not a controlled component, you don't need to update
   * the value during dragging.
   */
  value?: number;

  /**
   * Reverses the direction of the slider.
   */
  inverted?: boolean;

  /**
   * A string of one or more words to be announced by the screen reader.
   * Otherwise, it will announce the value as a percentage.
   * Requires passing a value to `accessibilityIncrements` to work correctly.
   * Should be a plural word, as singular units will be handled.
   */
  accessibilityUnits?: string;

  /**
   * A string of one or more words to be announced by the screen reader.
   * Otherwise, it will announce the value as a percentage.
   * Requires passing a value to `accessibilityIncrements` to work correctly.
   * Should be a plural word, as singular units will be handled.
   */
  accessibilityIncrements?: Array<string>;

  /**
   * Reference object.
   */
  ref?: React.MutableRefObject<SliderRef>;
}

/**
* A component used to select a single value from a range of values.
*/
declare class SliderComponent extends React.Component<SliderProps> {}
declare const SliderBase: ReactNative.Constructor<ReactNative.NativeMethodsMixin> & typeof SliderComponent;
export default class Slider extends SliderBase {}
export type SliderIOS = Slider;
