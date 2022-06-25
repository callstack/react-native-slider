'use strict';

import * as React from "react";
import type {NativeComponent} from 'react-native/Libraries/Renderer/shims/ReactNative';
import { StyleSheet, ViewProps, ImageURISource, StyleProp, ViewStyle, Platform,  } from "react-native";
import { RNCSliderNativeComponent } from "./RNCSliderNativeComponent";

type SliderReferenceType = (
  React.MutableRefObject<SliderRef> &
  React.LegacyRef<typeof Slider>
) | undefined;

export interface SliderPropsAndroid extends ViewProps {
  /**
   * Color of the foreground switch grip.
   */
  thumbTintColor?: string;
}

export interface SliderRef {
  updateValue(value: number): void;
}

export interface SliderPropsIOS extends ViewProps {
  /**
   * Assigns a maximum track image. Only static images are supported.
   * The leftmost pixel of the image will be stretched to fill the track.
   */
  maximumTrackImage?: ImageURISource;

  /**
   * Assigns a minimum track image. Only static images are supported.
   * The rightmost pixel of the image will be stretched to fill the track.
   */
  minimumTrackImage?: ImageURISource;

  /**
   * Permits tapping on the slider track to set the thumb position.
   * Defaults to false on iOS. No effect on Android or Windows.
   */
  tapToSeek?: boolean;

  /**
   * Sets an image for the thumb. Only static images are supported.
   */
  thumbImage?: ImageURISource;

  /**
   * Assigns a single image for the track. Only static images
   * are supported. The center pixel of the image will be stretched
   * to fill the track.
   */
  trackImage?: ImageURISource;
}

export interface SliderPropsWindows extends ViewProps {
  /**
   * Controls the orientation of the slider, default value is 'false' (horizontal).
   */
  vertical?: boolean;
}


export interface SliderProps extends SliderPropsIOS, SliderPropsAndroid, SliderPropsWindows {
  /**
   * If true the user won't be able to move the slider.
   * Default value is false.
   */
  disabled?: boolean;

  /**
   * The color used for the track to the right of the button.
   * Overrides the default blue gradient image.
   */
  maximumTrackTintColor?: string;

  /**
   * Initial maximum value of the slider. Default value is 1.
   */
  maximumValue?: number;

  /**
   * The color used for the track to the left of the button.
   * Overrides the default blue gradient image.
   */
  minimumTrackTintColor?: string;

  /**
   * Initial minimum value of the slider. Default value is 0.
   */
  minimumValue?: number;

  /**
   * Callback that is called when the user picks up the slider.
   * The initial value is passed as an argument to the callback handler.
   */
  onSlidingStart?: (value: number) => void;

  /**
   * Callback called when the user finishes changing the value (e.g. when the slider is released).
   */
  onSlidingComplete?: (value: number) => void;

  /**
   * Callback continuously called while the user is dragging the slider.
   */
  onValueChange?: (value: number) => void;

  /**
   * Step value of the slider. The value should be between 0 and (maximumValue - minimumValue). Default value is 0.
   */
  step?: number;

  /**
   * Used to style and layout the Slider. See StyleSheet.js and ViewStylePropTypes.js for more info.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Used to locate this view in UI automation tests.
   */
  testID?: string;

  /**
   * Initial value of the slider. The value should be between minimumValue
   * and maximumValue, which default to 0 and 1 respectively.
   * Default value is 0.
   * This is not a controlled component, you don't need to update
   * the value during dragging.
   */
  value?: number;

  /**
   * Reverses the direction of the slider.
   */
  inverted?: boolean;

  /**
   * A string of one or more words to be announced by the screen reader.
   * Otherwise, it will announce the value as a percentage.
   * Requires passing a value to `accessibilityIncrements` to work correctly.
   * Should be a plural word, as singular units will be handled.
   */
  accessibilityUnits?: string;

  /**
   * A string of one or more words to be announced by the screen reader.
   * Otherwise, it will announce the value as a percentage.
   * Requires passing a value to `accessibilityIncrements` to work correctly.
   * Should be a plural word, as singular units will be handled.
   */
  accessibilityIncrements?: Array<string>;

  /**
   * Reference object.
   */
  ref?: SliderReferenceType;
}

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
  props: SliderProps,
  forwardedRef?: React.Ref<typeof RNCSliderNativeComponent>,
) => {
  const style = StyleSheet.compose(
    styles.slider,
    props.style,
  );

  const {
    onValueChange,
    onSlidingStart,
    onSlidingComplete,
    onAccessibilityAction,
    ...localProps
  } = props;

  const onValueChangeEvent = onValueChange
    ? (event: Event) => {
        onValueChange(event.nativeEvent.value);
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
  const onAccessibilityActionEvent = onAccessibilityAction
    ? (event: AccessibilityActionEvent) => {
        onAccessibilityAction(event.nativeEvent.value);
      }
    : null;

  return (
    <RNCSliderNativeComponent
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
      onRNCSliderAccessibilityAction={onAccessibilityActionEvent}
    />
  );
};

const SliderWithRef = React.forwardRef(SliderComponent);

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

const Slider = (SliderWithRef: NativeComponent<SliderProps>);
export default Slider;
