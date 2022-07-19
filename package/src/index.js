// @flow

import {requireNativeComponent} from 'react-native';
import type {NativeComponent} from 'react-native/Libraries/Renderer/shims/ReactNative';
import type {NativeProps} from './RNCSliderNativeComponent';
const isFabricEnabled = global.nativeFabricUIManager != null;

type RNCSliderType = Class<NativeComponent<NativeProps>>;

const RNCSlider = isFabricEnabled
  ? require('./RNCSliderNativeComponent').default
  : ((requireNativeComponent('RNCSlider'): any): RNCSliderType);

export default RNCSlider;
