//@ts-ignore
import ReactDOM from 'react-dom';
import React, {RefObject, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ColorValue,
  ViewStyle,
  NativeSyntheticEvent,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';

type Event = NativeSyntheticEvent<
  Readonly<{
    value: number;
    /**
     * Android Only.
     */
    fromUser?: boolean;
  }>
>;

export interface Props {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  minimumTrackTintColor: ColorValue;
  maximumTrackTintColor: ColorValue;
  thumbTintColor: ColorValue;
  thumbStyle: ViewStyle;
  style: ViewStyle;
  inverted: boolean;
  enabled: boolean;
  trackHeight: number;
  thumbSize: number;
  onRNCSliderSlidingStart: (value: number) => void;
  onRNCSliderSlidingComplete: (value: number) => void;
  onRNCSliderValueChange: (value: number) => void;
}

const RCTSliderWebComponent = React.forwardRef(
  (
    {
      value: initialValue,
      minimumValue = 0,
      maximumValue = 0,
      step = 1,
      minimumTrackTintColor = '#009688',
      maximumTrackTintColor = '#939393',
      thumbTintColor = '#009688',
      thumbStyle = {},
      style = {},
      inverted = false,
      enabled = true,
      trackHeight = 4,
      thumbSize = 20,
      onRNCSliderSlidingStart = (_: number) => {},
      onRNCSliderSlidingComplete = (_: number) => {},
      onRNCSliderValueChange = (_: number) => {},
      ...others
    }: Props,
    forwardedRef: any,
  ) => {
    const containerSize = React.useRef({width: 0, height: 0});
    const containerPositionX = React.useRef(0);
    const containerRef = forwardedRef || React.createRef();
    const hasBeenResized = React.useRef(false);
    const [value, setValue] = React.useState(initialValue || minimumValue);

    const onValueChange = useCallback(
      (value: number) => {
        onRNCSliderValueChange && onRNCSliderValueChange(value);
      },
      [onRNCSliderValueChange],
    );

    const onSlidingStart = useCallback(
      (value: number) => {
        onRNCSliderSlidingStart && onRNCSliderSlidingStart(value);
      },
      [onRNCSliderSlidingStart],
    );

    const onSlidingComplete = useCallback(
      (value: number) => {
        onRNCSliderSlidingComplete && onRNCSliderSlidingComplete(value);
      },
      [onRNCSliderSlidingComplete],
    );
    const updateValue = useCallback(
      (newValue: number) => {
        // Ensure that the value is correctly rounded
        const hardRounded =
          decimalPrecision.current < 20
            ? Number.parseFloat(newValue.toFixed(decimalPrecision.current))
            : newValue;

        // Ensure that the new value is still between the bounds
        const withinBounds = Math.max(
          minimumValue,
          Math.min(hardRounded, maximumValue),
        );
        if (value !== withinBounds) {
          setValue(withinBounds);
          onValueChange(withinBounds);
          return withinBounds;
        }
        return hardRounded;
      },
      [minimumValue, maximumValue, value, onValueChange],
    );

    React.useLayoutEffect(() => {
      updateValue(initialValue);
    }, [initialValue, updateValue]);

    const percentageValue =
      (value - minimumValue) / (maximumValue - minimumValue);
    const minPercent = percentageValue;
    const maxPercent = 1 - percentageValue;

    const onResize = () => {
      hasBeenResized.current = true;
    };
    React.useEffect(() => {
      //@ts-ignore
      window.addEventListener('resize', onResize);

      return () => {
        //@ts-ignore
        window.removeEventListener('resize', onResize);
      };
    }, []);

    const containerStyle = StyleSheet.compose(
      {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
      },
      style,
    );

    const trackStyle = {
      height: trackHeight,
      borderRadius: trackHeight / 2,
      userSelect: 'none',
    };

    const minimumTrackStyle = {
      ...trackStyle,
      backgroundColor: minimumTrackTintColor,
      flexGrow: minPercent * 100,
    };

    const maximumTrackStyle = {
      ...trackStyle,
      backgroundColor: maximumTrackTintColor,
      flexGrow: maxPercent * 100,
    };

    // const width = (containerSize.current ? containerSize.current.width : 0)
    // const valueOffset = (inverted ? (1 - percentageValue) : percentageValue) * width

    const thumbViewStyle = StyleSheet.compose(
      {
        width: thumbSize,
        height: thumbSize,
        // left: valueOffset - thumbSize / 2,
        // top: trackHeight / 2 - thumbSize / 2,
        // position: absolute,
        backgroundColor: thumbTintColor,
        zIndex: 1,
        borderRadius: thumbSize / 2,
        overflow: 'hidden',
      },
      thumbStyle,
    );

    const decimalPrecision = React.useRef(
      calculatePrecision(minimumValue, maximumValue, step),
    );
    React.useEffect(() => {
      decimalPrecision.current = calculatePrecision(
        minimumValue,
        maximumValue,
        step,
      );
    }, [maximumValue, minimumValue, step]);

    const updateContainerPositionX = () => {
      //@ts-ignore
      const positionX = ReactDOM.findDOMNode(
        (containerRef as RefObject<any>).current,
      ).getBoundingClientRect()?.x;
      containerPositionX.current = positionX ?? 0;
    };

    const getValueFromNativeEvent = (pageX: number) => {
      const {width = 1} = containerSize.current;

      if (hasBeenResized.current) {
        hasBeenResized.current = false;
        updateContainerPositionX();
      }
      const containerX = containerPositionX.current;

      if (pageX < containerX) {
        return inverted ? maximumValue : minimumValue;
      } else if (pageX > containerX + width) {
        return inverted ? minimumValue : maximumValue;
      } else {
        const x = pageX - containerX;
        const newValue = inverted
          ? maximumValue - ((maximumValue - minimumValue) * x) / width
          : minimumValue + ((maximumValue - minimumValue) * x) / width;

        return step ? Math.round(newValue / step) * step : newValue;
      }
    };

    const onTouchEnd = (nativeEvent: GestureResponderEvent) => {
      const newValue = updateValue(
        getValueFromNativeEvent(nativeEvent.currentTarget),
      );
      onSlidingComplete(newValue);
    };

    const onMove = (nativeEvent: GestureResponderEvent) => {
      updateValue(getValueFromNativeEvent(nativeEvent.currentTarget));
    };

    const accessibilityActions = (event: any) => {
      const tenth = (maximumValue - minimumValue) / 10;
      switch (event.nativeEvent.actionName) {
        case 'increment':
          updateValue(value + (step || tenth));
          break;
        case 'decrement':
          updateValue(value - (step || tenth));
          break;
      }
    };

    React.useImperativeHandle(
      forwardedRef,
      () => ({
        updateValue: (val: number) => {
          updateValue(val);
        },
      }),
      [updateValue],
    );

    return (
      <View
        onLayout={(nativeEvent: LayoutChangeEvent) => {
          containerSize.current.height = nativeEvent.currentTarget;
          containerSize.current.width = nativeEvent.currentTarget;
          if ((containerRef as RefObject<View>).current) {
            updateContainerPositionX();
          }
        }}
        accessibilityActions={[
          {name: 'increment', label: 'increment'},
          {name: 'decrement', label: 'decrement'},
        ]}
        onAccessibilityAction={accessibilityActions}
        accessible={true}
        accessibilityRole={'adjustable'}
        style={containerStyle}
        onStartShouldSetResponder={() => enabled}
        onMoveShouldSetResponder={() => enabled}
        onResponderGrant={() => onSlidingStart(value)}
        onResponderRelease={onTouchEnd}
        onResponderMove={onMove}
        {...others}>
        <View pointerEvents="none" style={minimumTrackStyle} />
        <View pointerEvents="none" style={thumbViewStyle} />
        <View pointerEvents="none" style={maximumTrackStyle} />
      </View>
    );
  },
);

// We should round number with the same precision as the min, max or step values if provided
function calculatePrecision(
  minimumValue: number,
  maximumValue: number,
  step: number,
) {
  if (!step) {
    return Infinity;
  } else {
    // Calculate the number of decimals we can encounter in the results
    const decimals = [minimumValue, maximumValue, step].map(
      (value) => ((value + '').split('.').pop() || '').length,
    );
    return Math.max(...decimals);
  }
}

RCTSliderWebComponent.displayName = 'RTCSliderWebComponent';

export default RCTSliderWebComponent;
