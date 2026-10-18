import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  ColorValue,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
  LayoutChangeEvent,
  AccessibilityActionEvent,
  Image,
  ImageSourcePropType,
} from 'react-native';
//@ts-ignore
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';
import {constants} from './utils/constants';

// Vega has useTVEventHandler, but the React Native typings do not.
const {useTVEventHandler} = require('react-native') as {
  useTVEventHandler: (handler: (event: RemoteEvent) => void) => void;
};

interface RemoteEvent {
  eventType: string;
  /** 0 when the key goes down, 1 when it comes up. */
  eventKeyAction?: number;
}

type Event = Readonly<{
  nativeEvent: {
    value: number;
  };
}>;

export interface Props {
  value?: number;
  minimumValue?: number;
  maximumValue?: number;
  lowerLimit?: number;
  upperLimit?: number;
  step?: number;
  minimumTrackTintColor?: ColorValue;
  maximumTrackTintColor?: ColorValue;
  thumbTintColor?: ColorValue;
  thumbImage?: ImageSource;
  style?: StyleProp<ViewStyle>;
  inverted?: boolean;
  disabled?: boolean;
  testID?: string;
  onRNCSliderSlidingStart?: ((event: Event) => void) | null;
  onRNCSliderSlidingComplete?: ((event: Event) => void) | null;
  onRNCSliderValueChange?: ((event: Event) => void) | null;
  onFocus?: (event: unknown) => void;
  onBlur?: (event: unknown) => void;
}

const valueToEvent = (value: number): Event => ({nativeEvent: {value}});

const TRACK_HEIGHT = 4;
const THUMB_SIZE = constants.THUMB_SIZE;
/** Without a step, one key press moves this share of the range. */
const KEY_FRACTION = 0.01;

/** Drops floating point noise such as 0.1 + 0.2 = 0.30000000000000004. */
const tidy = (value: number) => Number.parseFloat(value.toFixed(10));

/**
 * Slider for Vega OS (Fire TV), drawn in JS because Vega has no native slider view.
 * With D-pad focus, Left/Right move one step (1 % of the range without a step).
 */
const RCTSliderKeplerComponent = React.forwardRef<View, Props>(
  (
    {
      value: propValue = 0,
      minimumValue = 0,
      maximumValue = 1,
      lowerLimit = constants.LIMIT_MIN_VALUE,
      upperLimit = constants.LIMIT_MAX_VALUE,
      step = 0,
      minimumTrackTintColor = '#009688',
      maximumTrackTintColor = '#939393',
      thumbTintColor = '#009688',
      thumbImage,
      style,
      inverted = false,
      disabled = false,
      testID,
      onRNCSliderSlidingStart,
      onRNCSliderSlidingComplete,
      onRNCSliderValueChange,
      onFocus,
      onBlur,
      ...others
    },
    forwardedRef,
  ) => {
    const lowest = Math.max(minimumValue, lowerLimit);
    const highest = Math.min(maximumValue, upperLimit);
    const clamp = useCallback(
      (next: number) => tidy(Math.min(highest, Math.max(lowest, next))),
      [lowest, highest],
    );

    const [value, setValue] = useState(() => clamp(propValue));
    const [focused, setFocused] = useState(false);
    const valueRef = useRef(value);
    const focusedRef = useRef(false);
    const sliding = useRef(false);
    const trackWidth = useRef(0);

    // A new value from the app moves the slider without change events.
    useEffect(() => {
      const next = clamp(propValue);
      valueRef.current = next;
      setValue(next);
    }, [propValue, clamp]);

    const start = () => {
      if (!sliding.current) {
        sliding.current = true;
        onRNCSliderSlidingStart?.(valueToEvent(valueRef.current));
      }
    };
    /** Nearest step value (minimumValue + k * step) within the limits. */
    const onGrid = (next: number) => {
      if (!(step > 0)) {
        return clamp(next);
      }
      let snapped =
        minimumValue + Math.round((next - minimumValue) / step) * step;
      if (snapped > highest) {
        snapped -= step;
      }
      if (snapped < lowest) {
        snapped += step;
      }
      return clamp(snapped);
    };
    const moveTo = (next: number) => {
      const clamped = onGrid(next);
      if (clamped !== valueRef.current) {
        valueRef.current = clamped;
        setValue(clamped);
        onRNCSliderValueChange?.(valueToEvent(clamped));
      }
    };
    const complete = () => {
      if (sliding.current) {
        sliding.current = false;
        onRNCSliderSlidingComplete?.(valueToEvent(valueRef.current));
      }
    };

    const keyStep =
      step > 0 ? step : (maximumValue - minimumValue) * KEY_FRACTION;
    const stepBy = (direction: 1 | -1) =>
      moveTo(valueRef.current + direction * keyStep);

    useTVEventHandler((event: RemoteEvent) => {
      if (disabled || !focusedRef.current) {
        return;
      }
      if (event.eventType !== 'left' && event.eventType !== 'right') {
        return;
      }
      if (event.eventKeyAction === 1) {
        complete();
        return;
      }
      if (event.eventKeyAction !== undefined && event.eventKeyAction !== 0) {
        return;
      }
      const towardsMax = (event.eventType === 'right') !== inverted;
      start();
      stepBy(towardsMax ? 1 : -1);
    });

    const onAccessibilityAction = (event: AccessibilityActionEvent) => {
      const direction =
        event.nativeEvent.actionName === 'increment'
          ? 1
          : event.nativeEvent.actionName === 'decrement'
          ? -1
          : 0;
      if (direction === 0 || disabled) {
        return;
      }
      start();
      stepBy(direction);
      complete();
    };

    // Touch: the thumb centre runs from THUMB_SIZE / 2 to width - THUMB_SIZE / 2.
    const valueAt = (x: number) => {
      const usable = Math.max(1, trackWidth.current - THUMB_SIZE);
      const share = Math.min(1, Math.max(0, (x - THUMB_SIZE / 2) / usable));
      return (
        minimumValue +
        (inverted ? 1 - share : share) * (maximumValue - minimumValue)
      );
    };
    const onTouch = ({nativeEvent}: GestureResponderEvent) =>
      moveTo(valueAt(nativeEvent.locationX));

    const range = maximumValue - minimumValue || 1;
    const share = Math.min(1, Math.max(0, (value - minimumValue) / range));
    const filled = inverted ? 1 - share : share;
    const thumbSize = focused ? THUMB_SIZE * 1.4 : THUMB_SIZE;

    return (
      <View
        ref={forwardedRef}
        {...others}
        testID={testID}
        style={[styles.root, style]}
        focusable={!disabled}
        accessible={true}
        accessibilityRole="adjustable"
        accessibilityState={{disabled}}
        accessibilityValue={{min: minimumValue, max: maximumValue, now: value}}
        accessibilityActions={[
          {name: 'increment', label: 'increment'},
          {name: 'decrement', label: 'decrement'},
        ]}
        onAccessibilityAction={onAccessibilityAction}
        onFocus={(event) => {
          focusedRef.current = true;
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          focusedRef.current = false;
          setFocused(false);
          complete();
          onBlur?.(event);
        }}>
        <View
          testID={testID ? `${testID}-track` : undefined}
          style={styles.track}
          onLayout={({nativeEvent: {layout}}: LayoutChangeEvent) => {
            trackWidth.current = layout.width;
          }}
          onStartShouldSetResponder={() => !disabled}
          onMoveShouldSetResponder={() => !disabled}
          onResponderTerminationRequest={() => false}
          onResponderGrant={(event) => {
            start();
            onTouch(event);
          }}
          onResponderMove={onTouch}
          onResponderRelease={(event) => {
            onTouch(event);
            complete();
          }}>
          <View
            pointerEvents="none"
            style={[
              styles.line,
              {
                flex: filled,
                backgroundColor: inverted
                  ? maximumTrackTintColor
                  : minimumTrackTintColor,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                backgroundColor: thumbTintColor,
              },
              // A ring shows the D-pad focus from across the room.
              focused && styles.focusRing,
              disabled && styles.disabled,
            ]}>
            {thumbImage !== undefined ? (
              <Image
                source={thumbImage as ImageSourcePropType}
                style={styles.thumbImage}
              />
            ) : null}
          </View>
          <View
            pointerEvents="none"
            style={[
              styles.line,
              {
                flex: 1 - filled,
                backgroundColor: inverted
                  ? minimumTrackTintColor
                  : maximumTrackTintColor,
              },
            ]}
          />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  root: {justifyContent: 'center', minHeight: THUMB_SIZE * 2},
  track: {flexDirection: 'row', alignItems: 'center', height: THUMB_SIZE * 2},
  line: {height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2},
  thumb: {overflow: 'hidden'},
  focusRing: {borderWidth: 3, borderColor: '#ffffff'},
  disabled: {opacity: 0.5},
  thumbImage: {width: '100%', height: '100%'},
});

RCTSliderKeplerComponent.displayName = 'RCTSliderKeplerComponent';

export default RCTSliderKeplerComponent;
