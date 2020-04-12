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
import RCTSliderContainerNativeComponent, {RNCSliderProgressClippingViewNativeComponent} from './‏‏RNCSliderContainerNativeComponent';

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
      backgroundTrackState={backgroundTrack != null}
      maximumTrackState={maximumTrack != null}
      minimumTrackState={minimumTrack != null}
      thumbState={thumb != null}
    >      
      <TrackWrapper>{backgroundTrack}</TrackWrapper>
      <TrackWrapper>{maximumTrack}</TrackWrapper>
      <TrackWrapper>{minimumTrack}</TrackWrapper>
      <Slider
        {...localProps}
        style={null}
        ref={ref}
      />
      <Wrapper>{thumb}</Wrapper>
    </RCTSliderContainerNativeComponent>
  );
};

const extractChildren = (children) => children &&
  React.cloneElement(
    typeof children === 'function' ? children() : children,
    { collapsable: false }
  );

const Wrapper = ({ children }) => {
  return (
    <View
      style={StyleSheet.absoluteFill}
      collapsable={false}
      pointerEvents="none"
    >
      {extractChildren(children)}
    </View>
  );
}

const TrackWrapper = ({ children }) => {
  return (
    <RNCSliderProgressClippingViewNativeComponent
      style={StyleSheet.absoluteFill}
      collapsable={false}
      pointerEvents="none"
    >
      <View style={styles.default} collapsable={false}>
        {extractChildren(children)}
      </View>
    </RNCSliderProgressClippingViewNativeComponent>
  );
}

const styles = StyleSheet.create({
  default: {
    flex: 1
  }
})

const SliderWithRef = React.forwardRef(SliderContainer);

export default SliderWithRef;