import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ForwardedRef,
} from 'react';
import {
  Image,
  View,
  type ColorValue,
  type GestureResponderEvent,
  type HostComponent,
  type ImageSourcePropType,
  type LayoutChangeEvent,
} from 'react-native';

import type {NativeSliderProps} from './SliderNativeComponent';

const TRACK_HEIGHT = 4;
const THUMB_SIZE = 20;

const clamp = (value: number, minValue: number, maxValue: number) =>
  Math.min(Math.max(value, minValue), maxValue);

const snapToStep = (value: number, minValue: number, step?: number) => {
  if (!step) {
    return value;
  }

  return minValue + Math.round((value - minValue) / step) * step;
};

const getImageUri = (source: unknown): string | undefined => {
  if (!source) {
    return undefined;
  }

  if (typeof source === 'string') {
    return source;
  }

  if (Array.isArray(source)) {
    return getImageUri(source[0]);
  }

  if (typeof source === 'object') {
    const imageSource = source as {default?: unknown; uri?: unknown};

    if (typeof imageSource.uri === 'string') {
      return imageSource.uri;
    }

    return getImageUri(imageSource.default);
  }

  return undefined;
};

const getTrackImageStyle = (source: unknown, width: number) => {
  const uri = getImageUri(source);

  if (!uri) {
    return undefined;
  }

  return {
    backgroundImage: `url(${JSON.stringify(uri)})`,
    backgroundPosition: 'left center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${Math.max(width, 1)}px 100%`,
  } as never;
};

const SliderNativeComponent = React.forwardRef(
  (
    {
      minValue = 0,
      maxValue = 1,
      value: valueProp,
      step,
      onValueChange,
      onSlidingStart,
      onSlidingComplete,
      onLayout,
      style,
      disabled,
      inverted,
      lowerLimit = minValue,
      upperLimit = maxValue,
      minimumTrackTintColor = '#007aff',
      maximumTrackTintColor = '#b3b3b3',
      thumbTintColor = '#ffffff',
      accessibilityIncrements: _accessibilityIncrements,
      accessibilityUnits: _accessibilityUnits,
      maximumTrackImage,
      minimumTrackImage,
      tapToSeek: _tapToSeek,
      thumbImage,
      thumbSize: thumbSizeProp,
      trackImage,
      vertical: _vertical,
      ...props
    }: NativeSliderProps,
    ref: ForwardedRef<View>,
  ) => {
    const [width, setWidth] = useState(0);
    const [value, setValue] = useState(valueProp ?? minValue);
    const isSlidingRef = useRef(false);
    const valueRef = useRef(value);
    const thumbSize = thumbSizeProp ?? (thumbImage ? 48 : THUMB_SIZE);

    useEffect(() => {
      if (isSlidingRef.current) {
        return;
      }

      const nextValue = valueProp ?? minValue;
      valueRef.current = nextValue;
      setValue(nextValue);
    }, [minValue, valueProp]);

    const updateValue = useCallback(
      (event: GestureResponderEvent) => {
        if (disabled) {
          return;
        }

        const nextPercent = width > 0 ? event.nativeEvent.locationX / width : 0;
        const percent = inverted ? 1 - nextPercent : nextPercent;
        const nextValue = clamp(
          snapToStep(
            minValue + percent * (maxValue - minValue),
            minValue,
            step,
          ),
          lowerLimit,
          upperLimit,
        );

        valueRef.current = nextValue;
        setValue(nextValue);
        onValueChange?.({nativeEvent: {value: nextValue}} as never);
      },
      [
        disabled,
        inverted,
        lowerLimit,
        maxValue,
        minValue,
        onValueChange,
        step,
        upperLimit,
        width,
      ],
    );

    const startSliding = useCallback(
      (event: GestureResponderEvent) => {
        if (disabled) {
          return;
        }

        isSlidingRef.current = true;
        onSlidingStart?.({nativeEvent: {value: valueRef.current}} as never);
        updateValue(event);
      },
      [disabled, onSlidingStart, updateValue],
    );

    const completeSliding = useCallback(() => {
      if (disabled || !isSlidingRef.current) {
        return;
      }

      isSlidingRef.current = false;
      onSlidingComplete?.({
        nativeEvent: {value: valueRef.current},
      } as never);
    }, [disabled, onSlidingComplete]);

    const handleLayout = useCallback(
      (event: LayoutChangeEvent) => {
        setWidth(event.nativeEvent.layout.width);
        onLayout?.(event);
      },
      [onLayout],
    );

    const percent =
      maxValue === minValue
        ? 0
        : ((value - minValue) / (maxValue - minValue)) * 100;
    const renderedPercent = inverted ? 100 - percent : percent;
    const hasTrackImage = !!getImageUri(trackImage);
    const maximumTrackImageStyle = getTrackImageStyle(
      maximumTrackImage ?? trackImage,
      width,
    );
    const minimumTrackImageStyle = getTrackImageStyle(minimumTrackImage, width);
    const trackHeight =
      maximumTrackImageStyle || minimumTrackImageStyle || hasTrackImage
        ? 20
        : TRACK_HEIGHT;

    return (
      <View
        {...props}
        ref={ref}
        style={[
          {
            minHeight: 40,
            justifyContent: 'center',
            touchAction: 'none',
          } as never,
          style,
        ]}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={startSliding}
        onResponderMove={updateValue}
        onResponderRelease={completeSliding}
        onResponderTerminate={completeSliding}>
        <View
          style={[
            {
              width: '100%',
              height: trackHeight,
              borderRadius: trackHeight / 2,
              backgroundColor: maximumTrackImageStyle
                ? 'transparent'
                : (maximumTrackTintColor as ColorValue),
              opacity: disabled ? 0.5 : 1,
              overflow: 'hidden',
              pointerEvents: 'none',
            },
            maximumTrackImageStyle,
          ]}>
          <View
            style={[
              {
                height: trackHeight,
                width: `${clamp(renderedPercent, 0, 100)}%`,
                borderRadius: trackHeight / 2,
                backgroundColor:
                  minimumTrackImageStyle || hasTrackImage
                    ? 'transparent'
                    : (minimumTrackTintColor as ColorValue),
              },
              minimumTrackImageStyle,
            ]}
          />
        </View>
        {thumbImage ? (
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={thumbImage as ImageSourcePropType}
            style={[
              {
                position: 'absolute',
                left: `${clamp(renderedPercent, 0, 100)}%`,
                width: thumbSize,
                height: thumbSize,
                marginLeft: -thumbSize / 2,
                opacity: disabled ? 0.5 : 1,
              },
              {pointerEvents: 'none'} as never,
            ]}
          />
        ) : (
          <View
            style={{
              position: 'absolute',
              left: `${clamp(renderedPercent, 0, 100)}%`,
              width: thumbSize,
              height: thumbSize,
              marginLeft: -thumbSize / 2,
              borderRadius: thumbSize / 2,
              backgroundColor: thumbTintColor as ColorValue,
              borderColor: 'rgba(0, 0, 0, 0.18)',
              borderWidth: 1,
              opacity: disabled ? 0.5 : 1,
              pointerEvents: 'none',
            }}
          />
        )}
      </View>
    );
  },
);

export default SliderNativeComponent as unknown as HostComponent<NativeSliderProps>;
