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
      <Wrapper thumb>{thumb}</Wrapper>
    </RCTSliderContainerNativeComponent>
  );
};

const Wrapper = ({ children, thumb }) => {
  const el = children && React.cloneElement(typeof children === 'function' ? children() : children, { collapsable: false });
  return (
    <View
      style={StyleSheet.absoluteFill}
      collapsable={false}
      pointerEvents="none"
      overflow="hidden"
    >
      {
        thumb ?
          el :
          <View style={styles.default} collapsable={false} overflow="visible">
            {el}
          </View>

      }
    </View>
  );
}

const styles = StyleSheet.create({
  default: {
    flex: 1
  }
})

const SliderWithRef = React.forwardRef(SliderContainer);

export default SliderWithRef;