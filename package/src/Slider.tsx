import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  AccessibilityActionEvent,
  Image,
  type ColorValue,
  Platform,
  StyleSheet,
  type NativeSyntheticEvent,
  type ImageSource,
  type ImageSourcePropType,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import SliderNativeComponent, {
  type NativeSliderProps,
  type SliderChangeEvent,
} from './SliderNativeComponent';
import {StepsIndicator} from './components/StepsIndicator';
import type {MarkerProps} from './components/TrackMark';
import {constants} from './utils/constants';
import {styles as sliderStyles} from './utils/styles';

type IOSProps = Readonly<{
  trackImage?: ImageSource;
  minimumTrackImage?: ImageSource;
  maximumTrackImage?: ImageSource;
  tapToSeek?: boolean;
}>;

type WindowsProps = Readonly<{
  vertical?: boolean;
}>;

export type SliderProps = ViewProps &
  IOSProps &
  WindowsProps &
  Readonly<{
    style?: StyleProp<ViewStyle>;
    value?: number;
    step?: number;
    minimumValue?: number;
    maximumValue?: number;
    minValue?: number;
    maxValue?: number;
    lowerLimit?: number;
    upperLimit?: number;
    minimumTrackTintColor?: ColorValue;
    maximumTrackTintColor?: ColorValue;
    thumbTintColor?: ColorValue;
    disabled?: boolean;
    onValueChange?: (value: number) => void;
    onSlidingStart?: (value: number) => void;
    onSlidingComplete?: (value: number) => void;
    thumbImage?: ImageSource;
    thumbSize?: number;
    inverted?: boolean;
    StepMarker?: React.FC<MarkerProps>;
    renderStepNumber?: boolean;
    accessibilityUnits?: string;
    accessibilityIncrements?: Array<string>;
  }>;

const clamp = (nextValue: number, minimumValue: number, maximumValue: number) =>
  Math.min(Math.max(nextValue, minimumValue), maximumValue);

const resolveImageSource = (source?: ImageSource) =>
  source ? Image.resolveAssetSource(source as ImageSourcePropType) : undefined;

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderNativeComponent>,
  SliderProps
>(
  (
    {
      minValue,
      maxValue,
      minimumValue = minValue ?? 0,
      maximumValue = maxValue ?? 1,
      value = constants.SLIDER_DEFAULT_INITIAL_VALUE,
      lowerLimit = Platform.select({
        web: minimumValue,
        default: constants.LIMIT_MIN_VALUE,
      }),
      upperLimit = Platform.select({
        web: maximumValue,
        default: constants.LIMIT_MAX_VALUE,
      }),
      step = 0,
      inverted = false,
      tapToSeek = false,
      onValueChange,
      onSlidingStart,
      onSlidingComplete,
      onAccessibilityAction,
      style,
      StepMarker,
      renderStepNumber,
      accessibilityState,
      trackImage,
      minimumTrackImage,
      maximumTrackImage,
      thumbImage,
      thumbSize,
      thumbTintColor,
      ...props
    },
    forwardedRef,
  ) => {
    const [currentValue, setCurrentValue] = useState(
      clamp(value ?? minimumValue, minimumValue, maximumValue),
    );
    const [width, setWidth] = useState(0);

    useEffect(() => {
      if (lowerLimit >= upperLimit) {
        console.warn(
          'Invalid configuration: lower limit is supposed to be smaller than upper limit',
        );
      }
    }, [lowerLimit, upperLimit]);

    useEffect(() => {
      setCurrentValue(clamp(value ?? minimumValue, minimumValue, maximumValue));
    }, [maximumValue, minimumValue, value]);

    const stepResolution = step || constants.DEFAULT_STEP_RESOLUTION;
    const defaultStep = (maximumValue - minimumValue) / stepResolution;
    const stepLength = step || defaultStep;
    const options = useMemo(
      () =>
        Array.from(
          {
            length:
              Math.max(Math.round(step ? defaultStep : stepResolution), 0) + 1,
          },
          (_, index) => minimumValue + index * stepLength,
        ),
      [defaultStep, minimumValue, step, stepLength, stepResolution],
    );

    const nativeStep = useMemo(() => {
      if (!step) {
        return 0;
      }

      if (Platform.OS === 'android') {
        return Math.max(
          Math.round(Math.abs((maximumValue - minimumValue) / step)) - 1,
          0,
        );
      }

      return step;
    }, [maximumValue, minimumValue, step]);

    const handleValueChange = useCallback(
      (event: NativeSyntheticEvent<SliderChangeEvent>) => {
        const nextValue = event.nativeEvent.value;
        setCurrentValue(nextValue);
        onValueChange?.(nextValue);
      },
      [onValueChange],
    );

    const handleSlidingStart = useCallback(
      (event: NativeSyntheticEvent<SliderChangeEvent>) => {
        onSlidingStart?.(event.nativeEvent.value);
      },
      [onSlidingStart],
    );

    const handleSlidingComplete = useCallback(
      (event: NativeSyntheticEvent<SliderChangeEvent>) => {
        onSlidingComplete?.(event.nativeEvent.value);
      },
      [onSlidingComplete],
    );

    const handleAccessibilityAction = onAccessibilityAction
      ? (event: AccessibilityActionEvent) => {
          onAccessibilityAction(event);
        }
      : undefined;

    const disabled =
      typeof props.disabled === 'boolean'
        ? props.disabled
        : accessibilityState?.disabled === true;

    const nextAccessibilityState =
      typeof props.disabled === 'boolean'
        ? {...accessibilityState, disabled: props.disabled}
        : accessibilityState;

    const defaultStyle =
      Platform.OS === 'ios'
        ? sliderStyles.defaultSlideriOS
        : sliderStyles.defaultSlider;

    const shouldRenderStepOverlay = !!StepMarker || !!renderStepNumber;
    const shouldRenderCustomStepMarker = !!StepMarker;

    const resolvedTrackImage =
      Platform.OS === 'web' ? trackImage : resolveImageSource(trackImage);
    const resolvedMinimumTrackImage =
      Platform.OS === 'web'
        ? minimumTrackImage
        : resolveImageSource(minimumTrackImage);
    const resolvedMaximumTrackImage =
      Platform.OS === 'web'
        ? maximumTrackImage
        : resolveImageSource(maximumTrackImage);
    const resolvedThumbImage =
      Platform.OS === 'web' || shouldRenderStepOverlay
        ? thumbImage
        : resolveImageSource(thumbImage);

    return (
      <View
        onLayout={(event) => {
          setWidth(event.nativeEvent.layout.width);
        }}
        style={[
          defaultStyle,
          style,
          {justifyContent: 'center', overflow: 'visible'},
        ]}>
        {shouldRenderStepOverlay ? (
          <StepsIndicator
            options={options}
            sliderWidth={width}
            currentValue={currentValue}
            renderStepNumber={renderStepNumber}
            thumbImage={thumbImage}
            thumbSize={thumbSize}
            StepMarker={StepMarker}
            isLTR={inverted}
          />
        ) : null}
        <SliderNativeComponent
          {...(props as Omit<
            NativeSliderProps,
            | 'onValueChange'
            | 'onSlidingStart'
            | 'onSlidingComplete'
            | 'step'
            | 'minValue'
            | 'maxValue'
            | 'value'
          >)}
          accessibilityState={nextAccessibilityState}
          disabled={disabled}
          inverted={inverted}
          tapToSeek={tapToSeek}
          minValue={minimumValue}
          maxValue={maximumValue}
          lowerLimit={lowerLimit}
          upperLimit={upperLimit}
          value={Number.isNaN(value) ? undefined : value}
          step={nativeStep}
          trackImage={resolvedTrackImage}
          minimumTrackImage={resolvedMinimumTrackImage}
          maximumTrackImage={resolvedMaximumTrackImage}
          thumbImage={
            shouldRenderCustomStepMarker ? undefined : resolvedThumbImage
          }
          thumbSize={thumbSize}
          thumbTintColor={
            shouldRenderCustomStepMarker ||
            (thumbImage && shouldRenderStepOverlay)
              ? 'transparent'
              : thumbTintColor
          }
          ref={forwardedRef}
          onValueChange={handleValueChange}
          onSlidingStart={onSlidingStart ? handleSlidingStart : undefined}
          onSlidingComplete={
            onSlidingComplete ? handleSlidingComplete : undefined
          }
          onAccessibilityAction={handleAccessibilityAction}
          onStartShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          style={[
            styles.base,
            defaultStyle,
            {
              alignContent: 'center',
              alignItems: 'center',
              overflow: 'visible',
              width,
            },
          ]}
        />
      </View>
    );
  },
);

export type {MarkerProps};

Slider.displayName = 'Slider';

export default Slider;

const styles = StyleSheet.create({
  base: {
    minHeight: 40,
  },
});
