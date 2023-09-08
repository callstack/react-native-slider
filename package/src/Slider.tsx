import React, { Fragment, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  AccessibilityActionEvent,
  ViewProps,
  ViewStyle,
  ColorValue,
  NativeSyntheticEvent,
  StyleProp,
  View,
  ImageURISource,
  Text,
} from 'react-native';
import RCTSliderNativeComponent from './index';
//@ts-ignore
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';

import type {FC, Ref} from 'react';

const LIMIT_MIN_VALUE = Number.MIN_SAFE_INTEGER;
const LIMIT_MAX_VALUE = Number.MAX_SAFE_INTEGER;

type Event = NativeSyntheticEvent<
  Readonly<{
    value: number;
    /**
     * Android Only.
     */
    fromUser?: boolean;
  }>
>;

type TrackMarksProps = {
  isTrue: boolean;
  thumbImage?: ImageURISource;
  StepMarker?: FC<MarkerProps> | boolean;
}

type MarkerProps = {
  stepMarked: boolean;
}

type WindowsProps = Readonly<{
  /**
   * If true the slider will be inverted.
   * Default value is false.
   */
  vertical?: boolean;
}>;

type IOSProps = Readonly<{
  /**
   * Assigns a single image for the track. Only static images are supported.
   * The center pixel of the image will be stretched to fill the track.
   */
  trackImage?: ImageSource;

  /**
   * Assigns a minimum track image. Only static images are supported. The
   * rightmost pixel of the image will be stretched to fill the track.
   */
  minimumTrackImage?: ImageSource;

  /**
   * Assigns a maximum track image. Only static images are supported. The
   * leftmost pixel of the image will be stretched to fill the track.
   */
  maximumTrackImage?: ImageSource;

  /**
   * Permits tapping on the slider track to set the thumb position.
   * Defaults to false on iOS. No effect on Android or Windows.
   */
  tapToSeek?: boolean;
}>;

type Props = ViewProps &
  IOSProps &
  WindowsProps &
  Readonly<{
    /**
     * Used to style and layout the `Slider`.  See `StyleSheet.js` and
     * `DeprecatedViewStylePropTypes.js` for more info.
     */
    style?: StyleProp<ViewStyle>;

    /**
     * Write-only property representing the value of the slider.
     * Can be used to programmatically control the position of the thumb.
     * Entered once at the beginning still acts as an initial value.
     * The value should be between minimumValue and maximumValue,
     * which default to 0 and 1 respectively.
     * Default value is 0.
     *
     * This is not a controlled component, you don't need to update the
     * value during dragging.
     */
    value?: number;

    /**
     * Step value of the slider. The value should be
     * between 0 and (maximumValue - minimumValue).
     * Default value is 0.
     */
    step?: number;

    /**
     * Initial minimum value of the slider. Default value is 0.
     */
    minimumValue?: number;

    /**
     * Initial maximum value of the slider. Default value is 1.
     */
    maximumValue?: number;

    /**
     * The lower limit value of the slider. The user won't be able to slide below this limit.
     */
    lowerLimit?: number;

    /**
     * The upper limit value of the slider. The user won't be able to slide above this limit.
     */
    upperLimit?: number;

    /**
     * The color used for the track to the left of the button.
     * Overrides the default blue gradient image on iOS.
     */
    minimumTrackTintColor?: ColorValue;

    /**
     * The color used for the track to the right of the button.
     * Overrides the default blue gradient image on iOS.
     */
    maximumTrackTintColor?: ColorValue;
    /**
     * The color used to tint the default thumb images on iOS, or the
     * color of the foreground switch grip on Android.
     */
    thumbTintColor?: ColorValue;

    /**
     * If true the user won't be able to move the slider.
     * Default value is false.
     */
    disabled?: boolean;

    /**
     * Callback continuously called while the user is dragging the slider.
     */
    onValueChange?: (value: number) => void;

    /**
     * Callback that is called when the user touches the slider,
     * regardless if the value has changed. The current value is passed
     * as an argument to the callback handler.
     */
    onSlidingStart?: (value: number) => void;

    /**
     * Callback that is called when the user releases the slider,
     * regardless if the value has changed. The current value is passed
     * as an argument to the callback handler.
     */
    onSlidingComplete?: (value: number) => void;

    /**
     * Used to locate this view in UI automation tests.
     */
    testID?: string;

    /**
     * Sets an image for the thumb. Only static images are supported.
     */
    thumbImage?: ImageSource;

    /**
     * If true the slider will be inverted.
     * Default value is false.
     */
    inverted?: boolean;

    /**
     * Component to be rendered for each step indicator.
     */
    stepMarker?: FC<MarkerProps> | boolean;

    /**
     * 
     */
    renderStepNumber?: boolean;

    /**
     * A string of one or more words to be announced by the screen reader.
     * Otherwise, it will announce the value as a percentage.
     * Requires passing a value to `accessibilityIncrements` to work correctly.
     * Should be a plural word, as singular units will be handled.
     */
    accessibilityUnits?: string;

    /**
     * An array of values that represent the different increments displayed
     * by the slider. All the values passed into this prop must be strings.
     * Requires passing a value to `accessibilityUnits` to work correctly.
     * The number of elements must be the same as `maximumValue`.
     */
    accessibilityIncrements?: Array<string>;
  }>;

const SliderComponent = (
  props: Props,
  forwardedRef?: Ref<typeof RCTSliderNativeComponent>,
) => {
  const style = props.style ? [props.style, styles.slider] : styles.slider;

  const {
    onValueChange,
    onSlidingStart,
    onSlidingComplete,
    onAccessibilityAction,
    ...localProps
  } = props;
  const [currentValue, setCurrentValue] = useState(
    props.value ?? props.minimumValue
  );
  const [width, setWidth] = useState(0);
  const options = Array.from(
    { length: ((localProps.maximumValue! - localProps.minimumValue!) / (!!localProps.step ? localProps.step : 100) + 1) },
    (_, index) => index
  );

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
        onAccessibilityAction(event);
      }
    : null;

  const value =
    Number.isNaN(props.value) || !props.value ? undefined : props.value;

  const lowerLimit =
    !!localProps.lowerLimit || localProps.lowerLimit === 0
      ? localProps.lowerLimit
      : Platform.select({
          web: localProps.minimumValue,
          default: LIMIT_MIN_VALUE,
        });

  const upperLimit =
    !!localProps.upperLimit || localProps.upperLimit === 0
      ? localProps.upperLimit
      : Platform.select({
          web: localProps.maximumValue,
          default: LIMIT_MAX_VALUE,
        });

  return (
    <View
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
      style={[{ zIndex: 1, width: "100%" }, style]}
    >
    <RCTSliderNativeComponent
      {...localProps}
      value={value}
      lowerLimit={lowerLimit}
      upperLimit={upperLimit}
      accessibilityState={_accessibilityState}
      thumbImage={
        Platform.OS === 'web'
          ? props.thumbImage
          : props.stepMarker
          ? undefined
          : Image.resolveAssetSource(props.thumbImage)
      }
      ref={forwardedRef}
      style={[{ zIndex: 1, width: width }, styles.slider]}
      onChange={(event: Event) => {
        onValueChangeEvent && onValueChangeEvent(event);
        setCurrentValue(event.nativeEvent.value);
        if (onValueChange) {
          onValueChange(event.nativeEvent.value);
        }
      }}
      onRNCSliderSlidingStart={onSlidingStartEvent}
      onRNCSliderSlidingComplete={onSlidingCompleteEvent}
      onRNCSliderValueChange={onValueChangeEvent}
      disabled={_disabled}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onRNCSliderAccessibilityAction={onAccessibilityActionEvent}
      thumbTintColor={
        props.thumbImage && !!props.stepMarker
          ? "transparent"
          : props.thumbTintColor
      }
    />
      {props.stepMarker || !!props.renderStepNumber ? (
        <View
          pointerEvents="none"
          style={{
            width: width - (width/options.length * 2),
            flexDirection: "row",
            top: Platform.OS === "ios" ? -25 : -15,
            zIndex: 2,
          }}
        >
          {options.map((i, index) => {
            return (
              <Fragment key={index}>
                <View
                  style={{
                    alignItems: "center",
                    width: width / options.length,
                  }}
                >
                  <SliderTrackMark
                    key={`${index}-SliderTrackMark`}
                    isTrue={currentValue === i}
                    thumbImage={props.thumbImage}
                    StepMarker={props.stepMarker}
                  />
                  {props.renderStepNumber ? (
                    <Paragraph i={i} key={`${index}-Paragraph`} />
                  ) : null}
                </View>
              </Fragment>
            );
          })}
          </View>) : null}
    </View>
  );
};

function SliderTrackMark({ isTrue, thumbImage, StepMarker }: TrackMarksProps) {
  if (StepMarker && typeof StepMarker !== "boolean") {
    return <StepMarker stepMarked={isTrue} />;
  }
  return isTrue ? (
    <>
      {thumbImage ? (
        <View style={customizingStyles.outerTrue}>
          <Image source={thumbImage} accessibilityIgnoresInvertColors />
        </View>
      ) : (
        <View style={customizingStyles.innerTrue} />
      )}
    </>
  ) : (
    <View style={customizingStyles.inner} />
  );
}

function Paragraph({ i }: { i: number }) {
  return (
    <View style={{ marginTop: 20, alignItems: "center" }}>
      <Text>{i}</Text>
    </View>
  );
}

const SliderWithRef = React.forwardRef(SliderComponent);

SliderWithRef.defaultProps = {
  value: 0,
  minimumValue: 0,
  maximumValue: 1,
  step: 0,
  inverted: false,
  tapToSeek: false,
  lowerLimit: Platform.select({web: undefined, default: LIMIT_MIN_VALUE}),
  upperLimit: Platform.select({web: undefined, default: LIMIT_MAX_VALUE}),
};

const customizingStyles = StyleSheet.create({
  outer: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#11FF11",
    justifyContent: "center",
    alignItems: "center",
  },
  outerTrue: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#0F0FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    width: 2,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#111111",
  },
  innerTrue: {
    width: 2,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#0F0FFF",
  },
})

let styles = StyleSheet.create(
  Platform.OS === 'ios' ? {slider: {height: 40}} : {slider: {}},
);

export default SliderWithRef;
