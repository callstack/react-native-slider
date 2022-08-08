/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

import type {HostComponent} from 'react-native';
import type {ColorValue} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';
import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  Float,
  BubblingEventHandler,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

type Event = $ReadOnly<{|
  value: ?Float,
  fromUser?: ?boolean,
|}>;

type NativeProps = $ReadOnly<{|
  ...ViewProps,
  accessibilityUnits?: string,
  accessibilityIncrements?: $ReadOnlyArray<string>,
  disabled?: WithDefault<boolean, false>,
  enabled?: WithDefault<boolean, true>,
  inverted?: WithDefault<boolean, false>,
  vertical?: ?boolean,
  tapToSeek?: WithDefault<boolean, false>,
  maximumTrackImage?: ?ImageSource,
  maximumTrackTintColor?: ?ColorValue,
  maximumValue?: ?Float,
  minimumTrackImage?: ?ImageSource,
  minimumTrackTintColor?: ?ColorValue,
  minimumValue?: ?Float,
  onChange?: ?BubblingEventHandler<Event>,
  onRNCSliderSlidingStart?: ?BubblingEventHandler<Event>,
  onRNCSliderSlidingComplete?: ?BubblingEventHandler<Event>,
  onRNCSliderValueChange?: ?BubblingEventHandler<Event>,
  step?: ?Float,
  testID?: ?string,
  thumbImage?: ?ImageSource,
  thumbTintColor?: ?ColorValue,
  trackImage?: ?ImageSource,
  value?: ?Float,
|}>;

export default (codegenNativeComponent<NativeProps>(
  'RNCSlider',
): HostComponent<NativeProps>);
