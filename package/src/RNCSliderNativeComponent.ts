import type {ColorValue, HostComponent, ViewProps} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
//@ts-ignore
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';
import type {
  Float,
  BubblingEventHandler,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

type Event = Readonly<{
  value: Float;
  fromUser?: boolean;
}>;

export interface NativeProps extends ViewProps {
  accessibilityUnits?: string;
  accessibilityIncrements?: ReadonlyArray<string>;
  disabled?: WithDefault<boolean, false>;
  enabled?: WithDefault<boolean, true>;
  inverted?: WithDefault<boolean, false>;
  vertical?: boolean;
  tapToSeek?: WithDefault<boolean, false>;
  maximumTrackImage?: ImageSource;
  maximumTrackTintColor?: ColorValue;
  maximumValue?: Float;
  minimumTrackImage?: ImageSource;
  minimumTrackTintColor?: ColorValue;
  minimumValue?: Float;
  onChange?: BubblingEventHandler<Event>;
  onRNCSliderSlidingStart?: BubblingEventHandler<Event>;
  onRNCSliderSlidingComplete?: BubblingEventHandler<Event>;
  onRNCSliderValueChange?: BubblingEventHandler<Event>;
  step?: Float;
  testID?: string;
  thumbImage?: ImageSource;
  thumbTintColor?: ColorValue;
  trackImage?: ImageSource;
  value?: Float;
}

export default codegenNativeComponent<NativeProps>(
  'RNCSlider',
) as HostComponent<NativeProps>;
