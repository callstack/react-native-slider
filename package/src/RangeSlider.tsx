import React, {Ref, useCallback, useEffect, useRef, useState} from 'react';
import {
  AccessibilityActionEvent,
  ColorValue,
  GestureResponderEvent,
  Image,
  ImageStyle,
  ImageSource,
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleProp,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import type {FC} from 'react';
import {constants} from './utils/constants';
import type {MarkerProps} from './components/TrackMark';

export type RangeValue = [number, number];
export type RangeThumbIndex = 0 | 1;

type RangeSliderProps = ViewProps &
  Readonly<{
    value?: number;
    values?: RangeValue;
    minimumValue: number;
    maximumValue: number;
    lowerLimit: number;
    upperLimit: number;
    minimumRange?: number;
    step: number;
    inverted: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    minimumTrackTintColor?: ColorValue;
    maximumTrackTintColor?: ColorValue;
    thumbTintColor?: ColorValue;
    thumbImage?: ImageSource;
    thumbSize?: number;
    StepMarker?: FC<MarkerProps>;
    renderStepNumber?: boolean;
    accessibilityUnits?: string;
    accessibilityIncrements?: Array<string>;
    maximumTrackImage?: ImageSource;
    minimumTrackImage?: ImageSource;
    tapToSeek?: boolean;
    trackImage?: ImageSource;
    vertical?: boolean;
    onValuesChange?: (values: RangeValue, thumbIndex: RangeThumbIndex) => void;
    onRangeSlidingStart?: (
      values: RangeValue,
      thumbIndex: RangeThumbIndex,
    ) => void;
    onRangeSlidingComplete?: (
      values: RangeValue,
      thumbIndex: RangeThumbIndex,
    ) => void;
  }>;

const DEFAULT_MINIMUM_TRACK_TINT_COLOR = '#007aff';
const DEFAULT_MAXIMUM_TRACK_TINT_COLOR = '#b3b3b3';
const DEFAULT_THUMB_TINT_COLOR = '#ffffff';
const TRACK_HEIGHT = 4;
const THUMB_IMAGE_STYLE: ImageStyle = {width: '100%', height: '100%'};

const getPrecision = (
  minimumValue: number,
  maximumValue: number,
  step: number,
) => {
  if (!step) {
    return Infinity;
  }

  const decimals = [minimumValue, maximumValue, step].map(
    (value) => ((value + '').split('.').pop() || '').length,
  );
  return Math.max(...decimals);
};

const roundToStep = (
  value: number,
  minimumValue: number,
  maximumValue: number,
  step: number,
) => {
  if (!step) {
    return value;
  }

  const precision = getPrecision(minimumValue, maximumValue, step);
  const stepped =
    minimumValue + Math.round((value - minimumValue) / step) * step;

  return precision < 20
    ? Number.parseFloat(stepped.toFixed(precision))
    : stepped;
};

const clamp = (value: number, minimumValue: number, maximumValue: number) => {
  return Math.max(minimumValue, Math.min(value, maximumValue));
};

const getBounds = ({
  minimumValue,
  maximumValue,
  lowerLimit,
  upperLimit,
}: Pick<
  RangeSliderProps,
  'minimumValue' | 'maximumValue' | 'lowerLimit' | 'upperLimit'
>) => {
  return {
    minimum: Math.max(minimumValue, lowerLimit),
    maximum: Math.min(maximumValue, upperLimit),
  };
};

const normalizeSingleValue = (
  value: number,
  props: Pick<
    RangeSliderProps,
    'minimumValue' | 'maximumValue' | 'lowerLimit' | 'upperLimit' | 'step'
  >,
) => {
  const bounds = getBounds(props);
  const stepped = roundToStep(
    value,
    props.minimumValue,
    props.maximumValue,
    props.step,
  );

  return clamp(stepped, bounds.minimum, bounds.maximum);
};

const normalizeRange = (
  values: RangeValue,
  props: Pick<
    RangeSliderProps,
    | 'minimumValue'
    | 'maximumValue'
    | 'lowerLimit'
    | 'upperLimit'
    | 'minimumRange'
    | 'step'
  >,
  activeThumb?: RangeThumbIndex,
): RangeValue => {
  const bounds = getBounds(props);
  const minimumRange = Math.max(0, props.minimumRange ?? 0);
  let lower = normalizeSingleValue(values[0], props);
  let upper = normalizeSingleValue(values[1], props);

  if (lower > upper && activeThumb === 0) {
    lower = upper;
  } else if (lower > upper && activeThumb === 1) {
    upper = lower;
  } else if (lower > upper) {
    [lower, upper] = [upper, lower];
  }

  if (upper - lower < minimumRange) {
    if (activeThumb === 0) {
      lower = upper - minimumRange;
    } else {
      upper = lower + minimumRange;
    }
  }

  if (lower < bounds.minimum) {
    lower = bounds.minimum;
    upper = lower + minimumRange;
  }

  if (upper > bounds.maximum) {
    upper = bounds.maximum;
    lower = upper - minimumRange;
  }

  return [
    clamp(lower, bounds.minimum, bounds.maximum),
    clamp(upper, bounds.minimum, bounds.maximum),
  ];
};

const getInitialRange = ({
  values,
  value,
  minimumValue,
  maximumValue,
  lowerLimit,
  upperLimit,
  minimumRange,
  step,
}: Pick<
  RangeSliderProps,
  | 'values'
  | 'value'
  | 'minimumValue'
  | 'maximumValue'
  | 'lowerLimit'
  | 'upperLimit'
  | 'minimumRange'
  | 'step'
>): RangeValue => {
  const initialValues: RangeValue = values ?? [
    value ?? minimumValue,
    maximumValue,
  ];

  return normalizeRange(initialValues, {
    minimumValue,
    maximumValue,
    lowerLimit,
    upperLimit,
    minimumRange,
    step,
  });
};

const RangeSliderComponent = (
  {
    value,
    values,
    minimumValue,
    maximumValue,
    lowerLimit,
    upperLimit,
    minimumRange = 0,
    step,
    inverted,
    disabled,
    style,
    minimumTrackTintColor = DEFAULT_MINIMUM_TRACK_TINT_COLOR,
    maximumTrackTintColor = DEFAULT_MAXIMUM_TRACK_TINT_COLOR,
    thumbTintColor = DEFAULT_THUMB_TINT_COLOR,
    thumbImage,
    thumbSize = constants.THUMB_SIZE,
    onValuesChange,
    onRangeSlidingStart,
    onRangeSlidingComplete,
    onAccessibilityAction,
    testID,
    StepMarker: _StepMarker,
    renderStepNumber: _renderStepNumber,
    accessibilityUnits: _accessibilityUnits,
    accessibilityIncrements: _accessibilityIncrements,
    maximumTrackImage: _maximumTrackImage,
    minimumTrackImage: _minimumTrackImage,
    tapToSeek: _tapToSeek,
    trackImage: _trackImage,
    vertical: _vertical,
    ...props
  }: RangeSliderProps,
  forwardedRef?: Ref<any>,
) => {
  const [range, setRange] = useState(() =>
    getInitialRange({
      values,
      value,
      minimumValue,
      maximumValue,
      lowerLimit,
      upperLimit,
      minimumRange,
      step,
    }),
  );
  const [width, setWidth] = useState(0);
  const activeThumbRef = useRef<RangeThumbIndex>(0);
  const isSlidingRef = useRef(false);
  const rangeRef = useRef(range);
  const viewRef = useRef<View>(null);

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  useEffect(() => {
    if (isSlidingRef.current) {
      return;
    }

    setRange(
      getInitialRange({
        values,
        value,
        minimumValue,
        maximumValue,
        lowerLimit,
        upperLimit,
        minimumRange,
        step,
      }),
    );
  }, [
    value,
    values,
    minimumValue,
    maximumValue,
    lowerLimit,
    upperLimit,
    minimumRange,
    step,
  ]);

  React.useImperativeHandle(
    forwardedRef,
    () => ({
      updateValue: (nextValue: number) => {
        setRange((currentRange) =>
          normalizeRange([nextValue, currentRange[1]], {
            minimumValue,
            maximumValue,
            lowerLimit,
            upperLimit,
            minimumRange,
            step,
          }),
        );
      },
      updateValues: (nextValues: RangeValue) => {
        setRange(
          normalizeRange(nextValues, {
            minimumValue,
            maximumValue,
            lowerLimit,
            upperLimit,
            minimumRange,
            step,
          }),
        );
      },
    }),
    [minimumValue, maximumValue, lowerLimit, upperLimit, minimumRange, step],
  );

  const usableWidth = Math.max(1, width - thumbSize);
  const valueRange = maximumValue - minimumValue || 1;
  const lowerRatio = inverted
    ? (maximumValue - range[0]) / valueRange
    : (range[0] - minimumValue) / valueRange;
  const upperRatio = inverted
    ? (maximumValue - range[1]) / valueRange
    : (range[1] - minimumValue) / valueRange;
  const lowerLeft = clamp(lowerRatio, 0, 1) * usableWidth;
  const upperLeft = clamp(upperRatio, 0, 1) * usableWidth;
  const lowerCenter = lowerLeft + thumbSize / 2;
  const upperCenter = upperLeft + thumbSize / 2;
  const selectedTrackLeft = Math.min(lowerCenter, upperCenter);
  const selectedTrackWidth = Math.abs(upperCenter - lowerCenter);

  const getValueFromLocation = useCallback(
    (locationX: number) => {
      const percent = clamp((locationX - thumbSize / 2) / usableWidth, 0, 1);
      const adjustedPercent = inverted ? 1 - percent : percent;

      return normalizeSingleValue(minimumValue + adjustedPercent * valueRange, {
        minimumValue,
        maximumValue,
        lowerLimit,
        upperLimit,
        step,
      });
    },
    [
      thumbSize,
      usableWidth,
      inverted,
      minimumValue,
      maximumValue,
      valueRange,
      lowerLimit,
      upperLimit,
      step,
    ],
  );

  const getEventLocation = (event: GestureResponderEvent) => {
    const {locationX, pageX} = event.nativeEvent;
    return typeof locationX === 'number' ? locationX : pageX;
  };

  const getClosestThumb = useCallback((nextValue: number): RangeThumbIndex => {
    const currentRange = rangeRef.current;
    const lowerDistance = Math.abs(nextValue - currentRange[0]);
    const upperDistance = Math.abs(nextValue - currentRange[1]);

    if (lowerDistance === upperDistance) {
      return nextValue > (currentRange[0] + currentRange[1]) / 2 ? 1 : 0;
    }

    return lowerDistance < upperDistance ? 0 : 1;
  }, []);

  const updateThumbValue = useCallback(
    (thumbIndex: RangeThumbIndex, nextValue: number, emitChange: boolean) => {
      const nextRange = normalizeRange(
        thumbIndex === 0
          ? [nextValue, rangeRef.current[1]]
          : [rangeRef.current[0], nextValue],
        {
          minimumValue,
          maximumValue,
          lowerLimit,
          upperLimit,
          minimumRange,
          step,
        },
        thumbIndex,
      );

      rangeRef.current = nextRange;
      setRange(nextRange);

      if (emitChange) {
        onValuesChange?.(nextRange, thumbIndex);
      }

      return nextRange;
    },
    [
      minimumValue,
      maximumValue,
      lowerLimit,
      upperLimit,
      minimumRange,
      step,
      onValuesChange,
    ],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
    props.onLayout?.(event);
  };

  const onResponderGrant = (event: GestureResponderEvent) => {
    const nextValue = getValueFromLocation(getEventLocation(event));
    const thumbIndex = getClosestThumb(nextValue);

    activeThumbRef.current = thumbIndex;
    isSlidingRef.current = true;
    onRangeSlidingStart?.(rangeRef.current, thumbIndex);
  };

  const onResponderMove = (event: GestureResponderEvent) => {
    updateThumbValue(
      activeThumbRef.current,
      getValueFromLocation(getEventLocation(event)),
      true,
    );
  };

  const onResponderRelease = (event: GestureResponderEvent) => {
    const thumbIndex = activeThumbRef.current;
    const nextRange = updateThumbValue(
      thumbIndex,
      getValueFromLocation(getEventLocation(event)),
      false,
    );

    isSlidingRef.current = false;
    onRangeSlidingComplete?.(nextRange, thumbIndex);
  };

  const onResponderTerminate = () => {
    isSlidingRef.current = false;
  };

  const onAccessibilityActionEvent = (event: AccessibilityActionEvent) => {
    const tenth = (maximumValue - minimumValue) / 10;
    const thumbIndex = activeThumbRef.current;
    const delta = step || tenth;

    if (event.nativeEvent.actionName === 'increment') {
      updateThumbValue(thumbIndex, rangeRef.current[thumbIndex] + delta, true);
    }

    if (event.nativeEvent.actionName === 'decrement') {
      updateThumbValue(thumbIndex, rangeRef.current[thumbIndex] - delta, true);
    }

    onAccessibilityAction?.(event);
  };

  const thumbBaseStyle: ViewStyle = {
    position: 'absolute',
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbSize / 2,
    backgroundColor: thumbTintColor,
    borderColor: 'rgba(0, 0, 0, 0.18)',
    borderWidth: thumbImage ? 0 : 1,
    overflow: 'hidden',
    zIndex: 2,
  };
  const rootStyle = [
    {minHeight: Math.max(40, thumbSize), justifyContent: 'center' as const},
    style,
  ];
  const maximumTrackStyle: ViewStyle = {
    position: 'absolute',
    left: thumbSize / 2,
    right: thumbSize / 2,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: maximumTrackTintColor,
  };
  const selectedTrackStyle: ViewStyle = {
    position: 'absolute',
    left: selectedTrackLeft,
    width: selectedTrackWidth,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: minimumTrackTintColor,
  };
  const lowerThumbStyle = [thumbBaseStyle, {left: lowerLeft}];
  const upperThumbStyle = [thumbBaseStyle, {left: upperLeft}];

  return (
    <View
      {...props}
      ref={viewRef}
      testID={testID}
      style={rootStyle}
      onLayout={onLayout}
      accessibilityActions={[
        {name: 'increment', label: 'increment'},
        {name: 'decrement', label: 'decrement'},
      ]}
      accessibilityRole="adjustable"
      accessible
      onAccessibilityAction={onAccessibilityActionEvent}
      onStartShouldSetResponder={() => !disabled}
      onMoveShouldSetResponder={() => !disabled}
      onResponderGrant={onResponderGrant}
      onResponderMove={onResponderMove}
      onResponderRelease={onResponderRelease}
      onResponderTerminate={onResponderTerminate}
      onResponderTerminationRequest={() => false}
      pointerEvents={disabled ? 'none' : 'auto'}>
      <View pointerEvents="none" style={maximumTrackStyle} />
      <View
        pointerEvents="none"
        testID={testID ? `${testID}-selected-track` : undefined}
        style={selectedTrackStyle}
      />
      <View
        pointerEvents="none"
        testID={testID ? `${testID}-lower-thumb` : undefined}
        style={lowerThumbStyle}>
        {thumbImage ? (
          <Image
            source={thumbImage as ImageSourcePropType}
            style={THUMB_IMAGE_STYLE}
          />
        ) : null}
      </View>
      <View
        pointerEvents="none"
        testID={testID ? `${testID}-upper-thumb` : undefined}
        style={upperThumbStyle}>
        {thumbImage ? (
          <Image
            source={thumbImage as ImageSourcePropType}
            style={THUMB_IMAGE_STYLE}
          />
        ) : null}
      </View>
    </View>
  );
};

export const RangeSlider = React.forwardRef(RangeSliderComponent);
