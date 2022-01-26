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

import React from 'react';
import {Image, Platform, StyleSheet} from 'react-native';
import RCTSliderNativeComponent from './RNCSliderNativeComponent';

import type {Ref} from 'react';
import type {NativeComponent} from 'react-native/Libraries/Renderer/shims/ReactNative';
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {ColorValue} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
import type {SyntheticEvent} from 'react-native/Libraries/Types/CoreEventTypes';

type Event = SyntheticEvent<
  $ReadOnly<{|
    value: number,
    /**
     * Android Only.
     */
    fromUser?: boolean,
  |}>,
>;

type WindowsProps = $ReadOnly<{|
  /**
   * If true the slider will be inverted.
   * Default value is false.
   */
  vertical?: ?boolean,
|}>;

type IOSProps = $ReadOnly<{|
  /**
   * Assigns a single image for the track. Only static images are supported.
   * The center pixel of the image will be stretched to fill the track.
   */
  trackImage?: ?ImageSource,

  /**
   * Assigns a minimum track image. Only static images are supported. The
   * rightmost pixel of the image will be stretched to fill the track.
   */
  minimumTrackImage?: ?ImageSource,

  /**
   * Assigns a maximum track image. Only static images are supported. The
   * leftmost pixel of the image will be stretched to fill the track.
   */
  maximumTrackImage?: ?ImageSource,
|}>;

type Props = $ReadOnly<{|
  ...ViewProps,
  ...IOSProps,
  ...WindowsProps,

  /**
   * Used to style and layout the `Slider`.  See `StyleSheet.js` and
   * `DeprecatedViewStylePropTypes.js` for more info.
   */
  style?: ?ViewStyleProp,

  /**
   * Initial value of the slider. The value should be between minimumValue
   * and maximumValue, which default to 0 and 1 respectively.
   * Default value is 0.
   *
   * *This is not a controlled component*, you don't need to update the
   * value during dragging.
   */
  value?: ?number,

  /**
   * Step value of the slider. The value should be
   * between 0 and (maximumValue - minimumValue).
   * Default value is 0.
   */
  step?: ?number,

  /**
   * Initial minimum value of the slider. Default value is 0.
   */
  minimumValue?: ?number,

  /**
   * Initial maximum value of the slider. Default value is 1.
   */
  maximumValue?: ?number,

  /**
   * The color used for the track to the left of the button.
   * Overrides the default blue gradient image on iOS.
   */
  minimumTrackTintColor?: ?ColorValue,

  /**
   * The color used for the track to the right of the button.
   * Overrides the default blue gradient image on iOS.
   */
  maximumTrackTintColor?: ?ColorValue,
  /**
   * The color used to tint the default thumb images on iOS, or the
   * color of the foreground switch grip on Android.
   */
  thumbTintColor?: ?ColorValue,

  /**
   * If true the user won't be able to move the slider.
   * Default value is false.
   */
  disabled?: ?boolean,

  /**
   * Callback continuously called while the user is dragging the slider.
   */
  onValueChange?: ?(value: number) => void,

  /**
   * Callback that is called when the user touches the slider,
   * regardless if the value has changed. The current value is passed
   * as an argument to the callback handler.
   */

  onSlidingStart?: ?(value: number) => void,

  /**
   * Callback that is called when the user releases the slider,
   * regardless if the value has changed. The current value is passed
   * as an argument to the callback handler.
   */
  onSlidingComplete?: ?(value: number) => void,

  /**
   * Used to locate this view in UI automation tests.
   */
  testID?: ?string,

  /**
   * Sets an image for the thumb. Only static images are supported.
   */
  thumbImage?: ?ImageSource,

  /**
   * If true the slider will be inverted.
   * Default value is false.
   */
  inverted?: ?boolean,

  /**
   * A string of one or more words to be announced by the screen reader.
   * Otherwise, it will announce the value as a percentage.
   * Requires passing a value to `accessibilityIncrements` to work correctly.
   * Should be a plural word, as singular units will be handled.
   */
  accessibilityUnits?: string,

  /**
   * An array of values that represent the different increments displayed
   * by the slider. All the values passed into this prop must be strings.
   * Requires passing a value to `accessibilityUnits` to work correctly.
   * The number of elements must be the same as `maximumValue`.
   */
  accessibilityIncrements?: Array<string>,
|}>;

/**
 * A component used to select a single value from a range of values.
 *
 * ### Usage
 *
 * The example below shows how to use `Slider` to change
 * a value used by `Text`. The value is stored using
 * the state of the root component (`App`). The same component
 * subscribes to the `onValueChange`  of `Slider` and changes
 * the value using `setState`.
 *
 *```
 * import React from 'react';
 * import { StyleSheet, Text, View, Slider } from 'react-native';
 *
 * export default class App extends React.Component {
 *   constructor(props) {
 *     super(props);
 *     this.state = {
 *       value: 50
 *     }
 *   }
 *
 *   change(value) {
 *     this.setState(() => {
 *       return {
 *         value: parseFloat(value)
 *       };
 *     });
 *   }
 *
 *   render() {
 *     const {value} = this.state;
 *     return (
 *       <View style={styles.container}>
 *         <Text style={styles.text}>{String(value)}</Text>
 *         <Slider
 *           step={1}
 *           maximumValue={100}
 *           onValueChange={this.change.bind(this)}
 *           value={value} />
 *       </View>
 *     );
 *   }
 * }
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     flex: 1,
 *     flexDirection: 'column',
 *     justifyContent: 'center'
 *   },
 *   text: {
 *     fontSize: 50,
 *     textAlign: 'center'
 *   }
 * });
 *```
 *
 */
const SliderComponent = (
  props: Props,
  forwardedRef?: ?Ref<typeof RCTSliderNativeComponent>,
) => {
  const style = StyleSheet.compose(
    styles.slider,
    props.style,
  );

  const {
    onValueChange,
    onSlidingStart,
    onSlidingComplete,
    ...localProps
  } = props;

  const onValueChangeEvent = onValueChange
    ? (event: Event) => {
        let userEvent = true;
        if (Platform.OS === 'android') {
          // On Android there's a special flag telling us the user is
          // dragging the slider.
          userEvent =
            event.nativeEvent.fromUser != null && event.nativeEvent.fromUser;
        }
        userEvent && onValueChange(event.nativeEvent.value);
      }
    : null;

  const _disabled =
    typeof props.disabled === 'boolean'
      ? props.disabled
      : props.accessibilityState?.disabled === true;

  const _accessibilityState =
    typeof props.disabled === 'boolean'
      ? {...props.accessibilityState, disabled: props.disabled}
      : props.accessibilityState;

  const onChangeEvent = onValueChangeEvent;
  const onSlidingStartEvent = onSlidingStart
    ? (event: Event) => {
        onSlidingStart(event.nativeEvent.value);
      }
    : null;
  const onSlidingCompleteEvent = onSlidingComplete
    ? (event: Event) => {
        onSlidingComplete(event.nativeEvent.value);
      }
    : null;

  return (
    <RCTSliderNativeComponent
      {...localProps}
      thumbImage={
        Platform.OS === 'web'
          ? props.thumbImage
          : Image.resolveAssetSource(props.thumbImage)
      }
      ref={forwardedRef}
      style={style}
      onChange={onChangeEvent}
      onRNCSliderSlidingStart={onSlidingStartEvent}
      onRNCSliderSlidingComplete={onSlidingCompleteEvent}
      onRNCSliderValueChange={onValueChangeEvent}
      enabled={!_disabled}
      disabled={_disabled}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      accessibilityState={_accessibilityState}
    />
  );
};

const SliderWithRef = React.forwardRef(SliderComponent);

/* $FlowFixMe(>=0.89.0 site=react_native_fb) This comment suppresses an error
 * found when Flow v0.89 was deployed. To see the error, delete this comment
 * and run Flow. */

SliderWithRef.defaultProps = {
  value: 0,
  minimumValue: 0,
  maximumValue: 1,
  step: 0,
  inverted: false,
  tapToSeek: false,
};

let styles;
if (Platform.OS === 'ios') {
  styles = StyleSheet.create({
    slider: {
      height: 40,
    },
  });
} else {
  styles = StyleSheet.create({
    slider: {},
  });
}

/* $FlowFixMe(>=0.89.0 site=react_native_fb) This comment suppresses an error
 * found when Flow v0.89 was deployed. To see the error, delete this comment
 * and run Flow. */
const Slider = (SliderWithRef: Class<NativeComponent<Props>>);
export default Slider;
