import type {HostComponent} from 'react-native';
import { ColorValue } from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';
import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
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
  maximumTrackImage?: ImageSource,
  maximumTrackTintColor?: ColorValue,
  maximumValue?: Float,
  minimumTrackImage?: ImageSource,
  minimumTrackTintColor?: ColorValue,
  minimumValue?: Float,
  onChange?: BubblingEventHandler<Event>,
  onRNCSliderSlidingStart?: BubblingEventHandler<Event>,
  onRNCSliderSlidingComplete?: BubblingEventHandler<Event>,
  onRNCSliderValueChange?: BubblingEventHandler<Event>,
  step?: Float,
  testID?: string,
  thumbImage?: ImageSource,
  thumbTintColor?: ColorValue,
  trackImage?: ImageSource,
  value?: Float,
}>;

const VIEW_MANAGER_NAME = 'RNCSlider';

export default (codegenNativeComponent<NativeProps>(
  VIEW_MANAGER_NAME,
) as HostComponent<NativeProps>);
