import React, {useEffect, useState} from 'react';
import {
  Image,
  Platform,
  AccessibilityActionEvent,
  ViewProps,
  ViewStyle,
  ColorValue,
  NativeSyntheticEvent,
  StyleProp,
  View,
} from 'react-native';
import RCTSliderNativeComponent from './index';
//@ts-ignore
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';

import type {FC, Ref} from 'react';
import {MarkerProps} from './components/TrackMark';
import {StepsIndicator} from './components/StepsIndicator';
import {styles} from './utils/styles';
import {constants} from './utils/constants';

type Event = NativeSyntheticEvent<
  Readonly<{
    value: number;
    /**
     * Android Only.
     */
    fromUser?: boolean;
  }>
>;

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
    onValueChange?: (_value: number) => void;

    /**
     * Callback that is called when the user touches the slider,
     * regardless if the value has changed. The current value is passed
     * as an argument to the callback handler.
     */
    onSlidingStart?: (_value: number) => void;

    /**
     * Callback that is called when the user releases the slider,
     * regardless if the value has changed. The current value is passed
     * as an argument to the callback handler.
     */
    onSlidingComplete?: (_value: number) => void;

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
    StepMarker?: FC<MarkerProps>;

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
  const {
    onValueChange,
    onSlidingStart,
    onSlidingComplete,
    onAccessibilityAction,
    ...localProps
  } = props;
  const [currentValue, setCurrentValue] = useState(
    props.value || props.minimumValue || constants.SLIDER_DEFAULT_INITIAL_VALUE,
  );
  const [width, setWidth] = useState(0);

  const stepResolution = localProps.step
    ? localProps.step
    : constants.DEFAULT_STEP_RESOLUTION;

  const defaultStep =
    (localProps.maximumValue! - localProps.minimumValue!) / stepResolution;
  const stepLength = localProps.step || defaultStep;

  const options = Array.from(
    {
      length: (localProps.step ? defaultStep : stepResolution) + 1,
    },
    (_, index) => localProps.minimumValue! + index * stepLength,
  );

  const defaultStyle =
    Platform.OS === 'ios' ? styles.defaultSlideriOS : styles.defaultSlider;
  const sliderStyle = {zIndex: 1, width: width};
  const style = [props.style, defaultStyle];

  const onValueChangeEvent = (event: Event) => {
    onValueChange && onValueChange(event.nativeEvent.value);
    setCurrentValue(event.nativeEvent.value);
  };

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
          default: constants.LIMIT_MIN_VALUE,
        });

  const upperLimit =
    !!localProps.upperLimit || localProps.upperLimit === 0
      ? localProps.upperLimit
      : Platform.select({
          web: localProps.maximumValue,
          default: constants.LIMIT_MAX_VALUE,
        });

  useEffect(() => {
    if (lowerLimit >= upperLimit) {
      console.warn(
        'Invalid configuration: lower limit is supposed to be smaller than upper limit',
      );
    }
  }, [lowerLimit, upperLimit]);

  return (
    <View
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
      style={[style, {justifyContent: 'center'}]}>
      {props.StepMarker || !!props.renderStepNumber ? (
        <StepsIndicator
          options={options}
          sliderWidth={width}
          currentValue={currentValue}
          renderStepNumber={localProps.renderStepNumber}
          thumbImage={localProps.thumbImage}
          StepMarker={localProps.StepMarker}
          isLTR={localProps.inverted}
        />
      ) : null}
      <RCTSliderNativeComponent
        {...localProps}
        value={value}
        lowerLimit={lowerLimit}
        upperLimit={upperLimit}
        accessibilityState={_accessibilityState}
        thumbImage={
          Platform.OS === 'web'
            ? props.thumbImage
            : props.StepMarker
            ? undefined
            : Image.resolveAssetSource(props.thumbImage)
        }
        ref={forwardedRef}
        style={[
          sliderStyle,
          defaultStyle,
          {alignContent: 'center', alignItems: 'center'},
        ]}
        onChange={onValueChangeEvent}
        onRNCSliderSlidingStart={onSlidingStartEvent}
        onRNCSliderSlidingComplete={onSlidingCompleteEvent}
        onRNCSliderValueChange={onValueChangeEvent}
        disabled={_disabled}
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onRNCSliderAccessibilityAction={onAccessibilityActionEvent}
        thumbTintColor={
          props.thumbImage && !!props.StepMarker
            ? 'transparent'
            : props.thumbTintColor
        }
      />
    </View>
  );
};

const SliderWithRef = React.forwardRef(SliderComponent);

SliderWithRef.defaultProps = {
  value: constants.SLIDER_DEFAULT_INITIAL_VALUE,
  minimumValue: 0,
  maximumValue: 1,
  step: 0,
  inverted: false,
  tapToSeek: false,
  lowerLimit: Platform.select({
    web: undefined,
    default: constants.LIMIT_MIN_VALUE,
  }),
  upperLimit: Platform.select({
    web: undefined,
    default: constants.LIMIT_MAX_VALUE,
  }),
};

export default SliderWithRef;
