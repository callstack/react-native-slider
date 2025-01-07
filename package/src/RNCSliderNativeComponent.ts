import type {ColorValue, HostComponent, ViewProps} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
//@ts-ignore
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';
import type {
  Float,
  WithDefault,
  DirectEventHandler,
  BubblingEventHandler,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';

type Event = Readonly<{
  value: Float;
  fromUser?: boolean;
}>;

export interface NativeProps extends ViewProps {
  accessibilityUnits?: string;
  accessibilityIncrements?: ReadonlyArray<string>;
  disabled?: WithDefault<boolean, false>;
  inverted?: WithDefault<boolean, false>;
  vertical?: WithDefault<boolean, false>;
  tapToSeek?: WithDefault<boolean, false>;
  maximumTrackImage?: ImageSource;
  maximumTrackTintColor?: ColorValue;
  maximumValue?: Double;
  minimumTrackImage?: ImageSource;
  minimumTrackTintColor?: ColorValue;
  bufferedTrackTintColor?: ColorValue;
  minimumValue?: Double;
  onChange?: BubblingEventHandler<Event>;
  onRNCSliderSlidingStart?: DirectEventHandler<Event>;
  onRNCSliderSlidingComplete?: DirectEventHandler<Event>;
  onRNCSliderValueChange?: BubblingEventHandler<Event>;
  step?: Double;
  testID?: string;
  thumbImage?: ImageSource;
  thumbTintColor?: ColorValue;
  trackImage?: ImageSource;
  value?: Float;
  bufferedValue?: Float;
  lowerLimit?: Float;
  upperLimit?: Float;
}

export default codegenNativeComponent<NativeProps>('RNCSlider', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
