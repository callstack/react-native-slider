import type {ColorValue, HostComponent, ImageSourcePropType, ViewProps} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  Float,
  BubblingEventHandler,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

type Event = Readonly<{
  value: Float,
  fromUser?: boolean,
}>;

type NativeProps = ViewProps & Readonly<{
  accessibilityUnits?: string,
  accessibilityIncrements?: ReadonlyArray<string>,
  disabled?: WithDefault<boolean, false>,
  enabled?: WithDefault<boolean, true>,
  inverted?: WithDefault<boolean, false>,
  vertical?: boolean,
  tapToSeek?: WithDefault<boolean, false>,
  maximumTrackImage?: ImageSourcePropType,
  maximumTrackTintColor?: ColorValue,
  maximumValue?: Float,
  minimumTrackImage?: ImageSourcePropType,
  minimumTrackTintColor?: ColorValue,
  minimumValue?: Float,
  onChange?: BubblingEventHandler<Event>,
  onRNCSliderSlidingStart?: BubblingEventHandler<Event>,
  onRNCSliderSlidingComplete?: BubblingEventHandler<Event>,
  onRNCSliderValueChange?: BubblingEventHandler<Event>,
  step?: Float,
  testID?: string,
  thumbImage?: ImageSourcePropType,
  thumbTintColor?: ColorValue,
  trackImage?: ImageSourcePropType,
  value?: Float,
}>;

const VIEW_MANAGER_NAME = 'RNCSlider';

export default (codegenNativeComponent<NativeProps>(
  VIEW_MANAGER_NAME,
) as HostComponent<NativeProps>);
