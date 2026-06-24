import * as React from "react";
import {type FC} from "react";
import * as ReactNative from "react-native";
import {type ImageURISource} from "react-native";

type Constructor<T> = new (...args: any[]) => T;

type SliderReferenceType =
  | (React.MutableRefObject<SliderRef> & React.LegacyRef<Slider>)
  | undefined;

export interface SliderPropsAndroid extends ReactNative.ViewProps {
  /**
   * Color of the foreground switch grip.
   */
  thumbTintColor?: string;
}

export interface SliderRef {
  updateValue(value: number): void;
}

export type TrackMarksProps = {
  isTrue: boolean;
  index: number;
  thumbImage?: ImageURISource;
  StepMarker?: FC<MarkerProps> | boolean;
  currentValue: number;
};

export type MarkerProps = {
  stepMarked: boolean;
  currentValue: number;
  index: number;
  min: number;
  max: number;
};

export interface SliderPropsIOS extends ReactNative.ViewProps {
  maximumTrackImage?: ReactNative.ImageURISource;
  minimumTrackImage?: ReactNative.ImageURISource;
  tapToSeek?: boolean;
  thumbImage?: ReactNative.ImageURISource;
  trackImage?: ReactNative.ImageURISource;
}

export interface SliderPropsWindows extends ReactNative.ViewProps {
  /**
   * Controls the orientation of the slider, default value is false.
   */
  vertical?: boolean;
}

export interface SliderProps
  extends SliderPropsIOS,
    SliderPropsAndroid,
    SliderPropsWindows {
  disabled?: boolean;
  maximumTrackTintColor?: string;
  maximumValue?: number;
  maxValue?: number;
  lowerLimit?: number;
  upperLimit?: number;
  minimumTrackTintColor?: string;
  minimumValue?: number;
  minValue?: number;
  onSlidingStart?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  onValueChange?: (value: number) => void;
  step?: number;
  style?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  testID?: string;
  value?: number;
  inverted?: boolean;
  thumbSize?: number;
  StepMarker?: FC<MarkerProps>;
  renderStepNumber?: boolean;
  accessibilityUnits?: string;
  accessibilityIncrements?: Array<string>;
  ref?: SliderReferenceType;
}

/**
 * A component used to select a single value from a range of values.
 */
declare class SliderComponent extends React.Component<SliderProps> {}
declare const SliderBase: Constructor<ReactNative.NativeMethods> &
  typeof SliderComponent;
export default class Slider extends SliderBase {}
export type SliderIOS = Slider;
