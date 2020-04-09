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

import { requireNativeComponent } from 'react-native';
import type { RNCSliderType } from './RNCSliderNativeComponent';

const RNCSliderContainerNativeComponent = ((requireNativeComponent(
  'RNCSliderContainer',
): any): RNCSliderType);
export default RNCSliderContainerNativeComponent;
