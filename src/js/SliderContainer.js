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
import { StyleSheet, View, I18nManager } from 'react-native';
import Slider from './Slider';
import RCTSliderContainerNativeComponent from './‏‏RNCSliderContainerNativeComponent';
import ProgressClippingView from './RNCProgressClippingView';

import type { Ref } from 'react';

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
      backgroundTrackState={backgroundTrack != null}
      maximumTrackState={maximumTrack != null}
      minimumTrackState={minimumTrack != null}
      thumbState={thumb != null}
    >
      <Wrapper>{backgroundTrack}</Wrapper>
      <Wrapper>{maximumTrack}</Wrapper>
      <Wrapper>{minimumTrack}</Wrapper>
      <Slider
        {...localProps}
        style={null}
        ref={ref}
      />
      <Wrapper thumb>{thumb}</Wrapper>
    </RCTSliderContainerNativeComponent>
  );
};

const extractChildren = (children) => children &&
  React.cloneElement(
    typeof children === 'function' ? children() : children,
    { collapsable: false }
  );

const Wrapper = ({ children, thumb }) => {
  const Component = thumb ? View : ProgressClippingView;
  return (
    <Component
      style={StyleSheet.absoluteFill}
      collapsable={false}
      pointerEvents="none"
    >
      <View style={thumb ? styles.thumb : styles.default} collapsable={false}>
        {extractChildren(children)}
      </View>
    </Component>
  );
}

const styles = StyleSheet.create({
  default: {
    flex: 1
  },
  thumb: {
    flex: 1,
    alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start'
  }
})

const SliderWithRef = React.forwardRef(SliderContainer);

export default SliderWithRef;