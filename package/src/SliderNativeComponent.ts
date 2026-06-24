import {
  type ColorValue,
  codegenNativeComponent,
  type HostComponent,
  type ImageSource,
  type ViewProps,
} from 'react-native';
import type {
  DirectEventHandler,
  Double,
  Float,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

export type SliderChangeEvent = Readonly<{
  value: Double;
  fromUser?: boolean;
}>;

export interface NativeSliderProps extends ViewProps {
  accessibilityUnits?: string;
  accessibilityIncrements?: ReadonlyArray<string>;
  disabled?: WithDefault<boolean, false>;
  inverted?: WithDefault<boolean, false>;
  vertical?: WithDefault<boolean, false>;
  tapToSeek?: WithDefault<boolean, false>;
  maximumTrackImage?: ImageSource;
  maximumTrackTintColor?: ColorValue;
  minimumTrackImage?: ImageSource;
  minimumTrackTintColor?: ColorValue;
  thumbImage?: ImageSource;
  thumbTintColor?: ColorValue;
  thumbSize?: Float;
  trackImage?: ImageSource;
  step?: Double;
  minValue?: Double;
  maxValue?: Double;
  value?: Float;
  lowerLimit?: Float;
  upperLimit?: Float;
  onValueChange?: DirectEventHandler<SliderChangeEvent> | null;
  onSlidingStart?: DirectEventHandler<SliderChangeEvent> | null;
  onSlidingComplete?: DirectEventHandler<SliderChangeEvent> | null;
}

export default codegenNativeComponent<NativeSliderProps>(
  'SliderView',
) as HostComponent<NativeSliderProps>;
