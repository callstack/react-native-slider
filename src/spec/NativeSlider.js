/**
 * @flow strict-local
 */

import * as React from 'react';

import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import {TurboModuleRegistry, StyleProp, ViewStyle} from 'react-native';
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';

export interface SliderRef {
  updateValue(value: number): void;
}

export interface Spec extends TurboModule {
  +getConstants: () => {||};

  /**
   * iOS props
   */
  trackImage?: ?ImageSource;
  minimumTrackImage?: ?ImageSource;
  maximumTrackImage?: ?ImageSource;

  /**
   * Windows props
   */
  vertical?: ?boolean;

  disabled?: boolean;
  maximumTrackTintColor?: string;
  maximumValue?: number;
  minimumTrackTintColor?: string;
  minimumValue?: number;
  onSlidingStart?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  onValueChange?: (value: number) => void;
  step?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  value?: number;
  inverted?: boolean;
  accessibilityUnits?: string;
  accessibilityIncrements?: Array<string>;
  ref?: React.MutableRefObject<SliderRef>;
}

export default (TurboModuleRegistry.get<Spec>('Slider'): ?Spec);
