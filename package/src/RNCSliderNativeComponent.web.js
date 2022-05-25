/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import ReactDOM from 'react-dom';
import React, {useCallback} from 'react';
import {View, StyleSheet} from 'react-native';

// import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
// import type {ColorValue} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
// import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
// import type {SyntheticEvent} from 'react-native/Libraries/Types/CoreEventTypes';

// type Props = $ReadOnly<{|
//   ...ViewProps,

//   /**
//    * Set to true to animate values with default 'timing' animation type
//    */
//   animateTransitions?: ?boolean,

//   /**
//    * Used to configure the animation parameters.  These are the same parameters in the Animated library.
//    */
//   animationConfig?: ?any,

//   /**
//    * Custom Animation type. 'spring' or 'timing'.
//    */
//   animationType?: 'spring' | 'timing' | undefined,

//   /**
//    * If true the user won't be able to move the slider.
//    * Default value is false.
//    */
//   disabled?: ?boolean,

//   /**
//    * Used to style and layout the `Slider`.  See `StyleSheet.js` and
//    * `DeprecatedViewStylePropTypes.js` for more info.
//    */
//   style?: ?ViewStyleProp,

//   /**
//    * Initial value of the slider. The value should be between minimumValue
//    * and maximumValue, which default to 0 and 1 respectively.
//    * Default value is 0.
//    *
//    * *This is not a controlled component*, you don't need to update the
//    * value during dragging.
//    */
//   value?: ?number,

//   /**
//    * Step value of the slider. The value should be
//    * between 0 and (maximumValue - minimumValue).
//    * Default value is 0.
//    */
//   step?: ?number,

//   /**
//    * Initial minimum value of the slider. Default value is 0.
//    */
//   minimumValue?: ?number,

//   /**
//    * Initial maximum value of the slider. Default value is 1.
//    */
//   maximumValue?: ?number,

//   /**
//    * The color used for the track to the left of the button.
//    * Overrides the default blue gradient image on iOS.
//    */
//   minimumTrackTintColor?: ?ColorValue,

//   /**
//    * The color used for the track to the right of the button.
//    * Overrides the default blue gradient image on iOS.
//    */
//   maximumTrackTintColor?: ?ColorValue,
//   /**
//    * The color used to tint the default thumb images on iOS, or the
//    * color of the foreground switch grip on Android.
//    */
//   thumbTintColor?: ?ColorValue,

//   /**
//    * If true the user won't be able to move the slider.
//    * Default value is false.
//    */
//   disabled?: ?boolean,

//   /**
//    * Callback continuously called while the user is dragging the slider.
//    */
//   onValueChange?: ?(value: number) => void,

//   /**
//    * Callback that is called when the user touches the slider,
//    * regardless if the value has changed. The current value is passed
//    * as an argument to the callback handler.
//    */

//   onSlidingStart?: ?(value: number) => void,

//   /**
//    * Callback that is called when the user releases the slider,
//    * regardless if the value has changed. The current value is passed
//    * as an argument to the callback handler.
//    */
//   onSlidingComplete?: ?(value: number) => void,

//   /**
//    * Used to locate this view in UI automation tests.
//    */
//   testID?: ?string,

//   /**
//    * Sets an image for the thumb. Only static images are supported.
//    */
//   thumbImage?: ?ImageSource,

//   /**
//    * If true the slider will be inverted.
//    * Default value is false.
//    */
//   inverted?: ?boolean,
// |}>;

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
      style = [],
      inverted = false,
      enabled = true,
      trackHeight = 4,
      thumbSize = 20,
      onRNCSliderSlidingStart = () => {},
      onRNCSliderSlidingComplete = () => {},
      onRNCSliderValueChange = () => {},
      ...others
    },
    forwardedRef,
  ) => {
    const onValueChange = useCallback(
      value => {
        onRNCSliderValueChange &&
          onRNCSliderValueChange({nativeEvent: {fromUser: true, value}});
      },
      [onRNCSliderValueChange],
    );

    const onSlidingStart = useCallback(
      value => {
        onRNCSliderSlidingStart &&
          onRNCSliderSlidingStart({nativeEvent: {fromUser: true, value}});
      },
      [onRNCSliderSlidingStart],
    );

    const onSlidingComplete = useCallback(
      value => {
        onRNCSliderSlidingComplete &&
          onRNCSliderSlidingComplete({nativeEvent: {fromUser: true, value}});
      },
      [onRNCSliderSlidingComplete],
    );

    const containerSize = React.useRef({width: 0, height: 0});
    const containerPositionX = React.useRef(0);
    const containerRef = forwardedRef || React.createRef();
    const hasBeenResized = React.useRef(false);
    const [value, setValue] = React.useState(initialValue || minimumValue);
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
      window.addEventListener('resize', onResize);

      return () => {
        window.removeEventListener('resize', onResize);
      };
    }, []);

    const containerStyle = StyleSheet.compose(
      {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 'auto',
        flexDirection: 'row',
        userSelect: 'none',
        alignItems: 'center',
        cursor: 'pointer',
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
        userSelect: 'none',
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
      const positionX = ReactDOM.findDOMNode(
        containerRef.current,
      )?.getBoundingClientRect()?.x;
      containerPositionX.current = positionX ?? 0;
    };

    const updateValue = useCallback(
      newValue => {
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

    const getValueFromNativeEvent = ({pageX}) => {
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

    const onTouchEnd = ({nativeEvent}) => {
      const newValue = updateValue(getValueFromNativeEvent(nativeEvent));
      onSlidingComplete(newValue);
    };

    const onMove = ({nativeEvent}) => {
      updateValue(getValueFromNativeEvent(nativeEvent));
    };

    const accessibilityActions = event => {
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
    const handleAccessibilityKeys = key => {
      switch (key) {
        case 'ArrowUp':
        case 'ArrowRight':
          accessibilityActions({nativeEvent: {actionName: 'increment'}});
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          accessibilityActions({nativeEvent: {actionName: 'decrement'}});
          break;
      }
    };

    React.useImperativeHandle(
      forwardedRef,
      () => ({
        updateValue: val => {
          updateValue(val);
        },
      }),
      [updateValue],
    );

    return (
      <View
        ref={containerRef}
        onLayout={({nativeEvent}) => {
          containerSize.current = nativeEvent.layout;
          if (containerRef.current) {
            updateContainerPositionX();
          }
        }}
        accessibilityActions={[
          {name: 'increment', label: 'increment'},
          {name: 'decrement', label: 'decrement'},
        ]}
        onAccessibilityAction={accessibilityActions}
        accessible={true}
        accessibleValue={value}
        accessibilityRole={'adjustable'}
        style={containerStyle}
        onStartShouldSetResponder={() => enabled}
        onMoveShouldSetResponder={() => enabled}
        onResponderGrant={() => onSlidingStart(value)}
        onResponderRelease={onTouchEnd}
        onResponderMove={onMove}
        onKeyDown={({nativeEvent: {key}}) => handleAccessibilityKeys(key)}
        {...others}>
        <View pointerEvents="none" style={minimumTrackStyle} />
        <View pointerEvents="none" style={thumbViewStyle} />
        <View pointerEvents="none" style={maximumTrackStyle} />
      </View>
    );
  },
);

// We should round number with the same precision as the min, max or step values if provided
function calculatePrecision(minimumValue, maximumValue, step) {
  if (!step) {
    return Infinity;
  } else {
    // Calculate the number of decimals we can encounter in the results
    const decimals = [minimumValue, maximumValue, step].map(
      value => ((value + '').split('.').pop() || '').length,
    );
    return Math.max(...decimals);
  }
}

RCTSliderWebComponent.displayName = 'RTCSliderWebComponent';

export default RCTSliderWebComponent;
