//@ts-ignore
import ReactDOM from 'react-dom';
import React, {RefObject, useCallback} from 'react';
import {
  Animated,
  View,
  StyleSheet,
  ColorValue,
  ViewStyle,
  GestureResponderEvent,
  LayoutChangeEvent,
  Image,
} from 'react-native';
//@ts-ignore
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';

type Event = Readonly<{
  nativeEvent: {
    value: number;
  };
}>;

type AnimationValues = {
  val: Animated.Value;
  min: Animated.Value;
  max: Animated.Value;
  diff: Animated.Value;
};

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
  disabled: boolean;
  trackHeight: number;
  thumbSize: number;
  thumbImage?: ImageSource;
  onRNCSliderSlidingStart: (event: Event) => void;
  onRNCSliderSlidingComplete: (event: Event) => void;
  onRNCSliderValueChange: (event: Event) => void;
}

const valueToEvent = (value: number): Event => ({nativeEvent: {value}});

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
      disabled = false,
      trackHeight = 4,
      thumbSize = 20,
      thumbImage,
      onRNCSliderSlidingStart = (_: Event) => {},
      onRNCSliderSlidingComplete = (_: Event) => {},
      onRNCSliderValueChange = (_: Event) => {},
      ...others
    }: Props,
    forwardedRef: any,
  ) => {
    const containerSize = React.useRef({width: 0, height: 0});
    const containerPositionX = React.useRef(0);
    const containerRef = forwardedRef || React.createRef();
    const containerPositionInvalidated = React.useRef(false);
    const [value, setValue] = React.useState(initialValue || minimumValue);
    const lastInitialValue = React.useRef<number>();
    const animationValues = React.useRef<AnimationValues>({
      val: new Animated.Value(value),
      min: new Animated.Value(minimumValue),
      max: new Animated.Value(maximumValue),
      // make sure we never divide by 0
      diff: new Animated.Value(maximumValue - minimumValue || 1),
    }).current;

    // update minimumValue & maximumValue animations
    React.useEffect(() => {
      animationValues.min.setValue(minimumValue);
      animationValues.max.setValue(maximumValue);
      // make sure we never divide by 0
      animationValues.diff.setValue(maximumValue - minimumValue || 1);
    }, [animationValues, minimumValue, maximumValue]);

    // compute animated slider position based on animated value
    const minPercent = React.useRef(
      Animated.multiply(
        new Animated.Value(100),
        Animated.divide(
          Animated.subtract(animationValues.val, animationValues.min),
          animationValues.diff,
        ),
      ),
    ).current;
    const maxPercent = React.useRef(
      Animated.subtract(new Animated.Value(100), minPercent),
    ).current;

    const onValueChange = useCallback(
      (value: number) => {
        onRNCSliderValueChange && onRNCSliderValueChange(valueToEvent(value));
      },
      [onRNCSliderValueChange],
    );

    const onSlidingStart = useCallback(
      (value: number) => {
        onRNCSliderSlidingStart && onRNCSliderSlidingStart(valueToEvent(value));
      },
      [onRNCSliderSlidingStart],
    );

    const onSlidingComplete = useCallback(
      (value: number) => {
        onRNCSliderSlidingComplete &&
          onRNCSliderSlidingComplete(valueToEvent(value));
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
      // we have to do this check because `initialValue` gets default to `0` by
      // Slider. If we don't this will get called every time `value` changes
      // as `updateValue` is mutated when value changes. The result of not
      // checking this is that the value constantly gets reset to `0` in
      // contexts where `value` is not managed externally.
      if (initialValue !== lastInitialValue.current) {
        lastInitialValue.current = initialValue;
        const newValue = updateValue(initialValue);
        animationValues.val.setValue(newValue);
      }
    }, [initialValue, updateValue, animationValues]);

    React.useEffect(() => {
      const invalidateContainerPosition = () => {
        containerPositionInvalidated.current = true;
      };
      const onDocumentScroll = (e: Event) => {
        const isAlreadyInvalidated = !containerPositionInvalidated.current;
        if (
          isAlreadyInvalidated &&
          containerRef.current &&
          // @ts-ignore
          e.target.contains(containerRef.current)
        ) {
          invalidateContainerPosition();
        }
      };
      //@ts-ignore
      window.addEventListener('resize', invalidateContainerPosition);
      //@ts-ignore
      document.addEventListener('scroll', onDocumentScroll, {capture: true});

      return () => {
        //@ts-ignore
        window.removeEventListener('resize', invalidateContainerPosition);

        //@ts-ignore
        document.removeEventListener('scroll', onDocumentScroll, {
          capture: true,
        });
      };
    }, [containerRef]);

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
      flexGrow: minPercent,
    };

    const maximumTrackStyle = {
      ...trackStyle,
      backgroundColor: maximumTrackTintColor,
      flexGrow: maxPercent,
    };

    const thumbViewStyle = StyleSheet.compose(
      {
        width: thumbSize,
        height: thumbSize,
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

      if (containerPositionInvalidated.current) {
        containerPositionInvalidated.current = false;
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

    const onTouchEnd = ({nativeEvent}: GestureResponderEvent) => {
      const newValue = updateValue(getValueFromNativeEvent(nativeEvent.pageX));
      animationValues.val.setValue(newValue);
      onSlidingComplete(newValue);
    };

    const onMove = ({nativeEvent}: GestureResponderEvent) => {
      const newValue = getValueFromNativeEvent(nativeEvent.pageX);
      animationValues.val.setValue(newValue);
      updateValue(newValue);
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
        ref={containerRef}
        onLayout={({nativeEvent: {layout}}: LayoutChangeEvent) => {
          containerSize.current.height = layout.height;
          containerSize.current.width = layout.width;
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
        {...others}
        // NOTE: gesture responders should all fall _after_ the {...others}
        // spread operator, or they may not work appropriately.
        onStartShouldSetResponder={() => !disabled}
        onMoveShouldSetResponder={() => !disabled}
        onResponderGrant={() => onSlidingStart(value)}
        onResponderRelease={onTouchEnd}
        onResponderMove={onMove}>
        <Animated.View pointerEvents="none" style={minimumTrackStyle} />
        <View pointerEvents="none" style={thumbViewStyle}>
          {thumbImage !== undefined ? (
            <Image
              source={thumbImage}
              style={{width: '100%', height: '100%'}}
            />
          ) : null}
        </View>
        <Animated.View pointerEvents="none" style={maximumTrackStyle} />
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
