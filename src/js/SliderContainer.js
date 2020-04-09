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

import React, { useImperativeHandle } from 'react';
import {StyleSheet, View} from 'react-native';
import Slider from './Slider';
import RCTSliderContainerNativeComponent from './‏‏RNCSliderContainerNativeComponent';

import type {Ref} from 'react';

const SliderContainer = (
  props: Props,
  forwardedRef?: ?Ref<typeof Slider>,
) => {
  const {
    backgroundTrack,
    minimumTrack,
    maximumTrack,
    thumb,
    ...localProps
  } = props;

  const ref = React.useRef();
  useImperativeHandle(forwardedRef, () => ref.current);

  return (
    <RCTSliderContainerNativeComponent
      {...localProps}
    >
      <Slider
        {...localProps}
        style={null}
        inverted={false}
        ref={ref}
      />
      <Wrapper>{backgroundTrack}</Wrapper>
      <Wrapper>{maximumTrack}</Wrapper>
      <Wrapper>{minimumTrack}</Wrapper>
      <Wrapper>{thumb}</Wrapper>
    </RCTSliderContainerNativeComponent>
  );
};

const Wrapper = ({ children }) => <View
  style={StyleSheet.absoluteFill}
  collapsable={false}
  pointerEvents="none">
  {typeof children === 'function' ? children() : children}
</View>;

const SliderWithRef = React.forwardRef(SliderContainer);

export default SliderWithRef;