import {requireNativeComponent} from 'react-native';

import type {ColorValue} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';
import type {NativeComponent} from 'react-native/Libraries/Renderer/shims/ReactNative';
import type {SyntheticEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';

type Event = SyntheticEvent<
  Readonly<{
    value: number,
    fromUser?: boolean,
  }>,
>;

type NativeProps = $ReadOnly<{|
  ...ViewProps,
  accessibilityUnits?: string,
  accessibilityIncrements?: Array<string>,
  disabled?: ?boolean,
  enabled?: ?boolean,
  inverted?: ?boolean,
  vertical?: ?boolean,
  maximumTrackImage?: ?ImageSource,
  maximumTrackTintColor?: ?ColorValue,
  maximumValue?: ?number,
  minimumTrackImage?: ?ImageSource,
  minimumTrackTintColor?: ?ColorValue,
  minimumValue?: ?number,
  onChange?: ?(event: Event) => void,
  onRNCSliderSlidingStart?: ?(event: Event) => void,
  onRNCSliderSlidingComplete?: ?(event: Event) => void,
  onRNCSliderValueChange?: ?(event: Event) => void,
  step?: ?number,
  testID?: ?string,
  thumbImage?: ?ImageSource,
  thumbTintColor?: ?ColorValue,
  trackImage?: ?ImageSource,
  value?: ?number,
|}>;

type RNCSliderType = Class<NativeComponent<NativeProps>>;

const RNCSliderNativeComponent = ((requireNativeComponent(
  'RNCSlider',
): any): RNCSliderType);
export default RNCSliderNativeComponent;
