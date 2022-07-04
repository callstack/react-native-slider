import {ColorValue, HostComponent, ImageURISource, requireNativeComponent, ViewProps} from 'react-native';

import type { ReactElement } from 'react';

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
  minimumTrackTintColor?: ColorValue,
  minimumValue?:number,
  onChange?: (value: number) => void,
  onRNCSliderSlidingStart?: (value: number) => void,
  onRNCSliderSlidingComplete?: (value: number) => void,
  onRNCSliderValueChange?: (value: number) => void,
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
