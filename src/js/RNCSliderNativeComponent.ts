import {HostComponent, ImageURISource, requireNativeComponent} from 'react-native';

import type {ColorValue} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import type {SyntheticEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
import type { ReactElement } from 'react';

type Event = SyntheticEvent<
  Readonly<{
    value: number,
    fromUser?: boolean,
  }>
>;

interface NativeProps extends ViewProps {
  accessibilityUnits?: string,
  accessibilityIncrements?: Array<string>,
  disabled?: boolean,
  enabled?: boolean,
  inverted?: boolean,
  vertical?: boolean,
  maximumTrackImage?: ImageURISource,
  maximumTrackTintColor?: ColorValue,
  maximumValue?: number,
  minimumTrackImage?: ImageURISource,
  minimumTrackTintColor?:ColorValue,
  minimumValue?:number,
  onChange?:(event: Event) => void,
  onRNCSliderSlidingStart?:(event: Event) => void,
  onRNCSliderSlidingComplete?:(event: Event) => void,
  onRNCSliderValueChange?:(event: Event) => void,
  step?:number,
  testID?:string,
  thumbImage?: ImageURISource,
  thumbTintColor?:ColorValue,
  trackImage?: ImageURISource,
  value?:number,
};

interface RNCSliderType extends HostComponent<NativeProps> {
  getInnerViewNode(): ReactElement;
};

export const RNCSliderNativeComponent = requireNativeComponent(
  'RNCSlider',
) as RNCSliderType;
