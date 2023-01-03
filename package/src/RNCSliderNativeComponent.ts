import type {ColorValue, HostComponent, ViewProps} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {ImageSourcePropType} from 'react-native';
import type {
  Float,
  WithDefault,
  DirectEventHandler,
  BubblingEventHandler,
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
  maximumTrackImage?: ImageSourcePropType;
  maximumTrackTintColor?: ColorValue;
  maximumValue?: Float;
  minimumTrackImage?: ImageSourcePropType;
  minimumTrackTintColor?: ColorValue;
  minimumValue?: Float;
  onChange?: BubblingEventHandler<Event>;
  onRNCSliderSlidingStart?: DirectEventHandler<Event>;
  onRNCSliderSlidingComplete?: DirectEventHandler<Event>;
  onRNCSliderValueChange?: BubblingEventHandler<Event>;
  step?: Float;
  testID?: string;
  thumbImage?: ImageSourcePropType;
  thumbTintColor?: ColorValue;
  trackImage?: ImageSourcePropType;
  value?: Float;
  lowerLimit?: Float;
  upperLimit?: Float;
}

export default codegenNativeComponent<NativeProps>(
  'RNCSlider',
) as HostComponent<NativeProps>;
