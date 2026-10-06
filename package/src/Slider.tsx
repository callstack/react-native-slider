import React, {useState} from 'react';
import {View} from 'react-native';
import type { NativeSyntheticEvent } from 'react-native';
import RNCSliderNativeComponent from './index';
import { type SliderProps } from '../typings';

type SliderValueChangeEvent = NativeSyntheticEvent<
  Readonly<{
    value: number;
  }>
>;

/**
 * Unwraps the value out of a native event, for a handler that only cares about
 * the value. A slider with no handler for an event must not pass one down
 * either, so that the native side can leave the event unsent.
 */
const valueHandler = (onChange?: (value: number) => void) =>
  onChange
    ? (event: SliderValueChangeEvent) => onChange(event.nativeEvent.value)
    : undefined;

const stepIndex = (
  value: number,
  minimumValue: number,
  maximumValue: number,
  step: number,
) => {
  if (step <= 0) {
    return 0;
  }

  const clamped = Math.min(
    Math.max(value, minimumValue),
    Math.max(maximumValue, minimumValue),
  );

  return Math.round((clamped - minimumValue) / step);
};

const useThumbValue = (value: number) => {
  const [dispatched, setDispatched] = useState({given: value, value});
  const current = dispatched.given === value ? dispatched.value : value;

  return [
    current,
    (newValue: number) => setDispatched({given: value, value: newValue}),
  ] as const;
};

const thumbValueHandler =
  (callback: (value: number) => void, onChange?: (value: number) => void) =>
  (value: number) => {
    callback(value);
    onChange?.(value);
  };

const Slider = ({
  minimumValue = 0,
  maximumValue = 1,
  value = 0,
  ranged = false,
  valueLeft = minimumValue,
  valueRight = maximumValue,
  step = 0,
  lowerLimit = minimumValue,
  upperLimit = maximumValue,
  orientation = "horizontal",
  onValueChange,
  onLeftValueChange,
  onRightValueChange,
  thumb: Thumb,
  track: Track,
  ...props
}: SliderProps) => {
  const [currentValue, setCurrentValue] = useThumbValue(value);
  const [currentValueLeft, setCurrentValueLeft] = useThumbValue(valueLeft);
  const [currentValueRight, setCurrentValueRight] = useThumbValue(valueRight);

  const handleValueChange = Thumb
    ? thumbValueHandler(setCurrentValue, onValueChange)
    : onValueChange;
  const handleLeftValueChange = Thumb
    ? thumbValueHandler(setCurrentValueLeft, onLeftValueChange)
    : onLeftValueChange;
  const handleRightValueChange = Thumb
    ? thumbValueHandler(setCurrentValueRight, onRightValueChange)
    : onRightValueChange;

  const thumbValues = ranged
    ? [currentValueLeft, currentValueRight]
    : [currentValue];

  return (
    <RNCSliderNativeComponent
      {...props}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      value={value}
      ranged={ranged}
      valueLeft={valueLeft}
      valueRight={valueRight}
      step={step}
      lowerLimit={lowerLimit}
      upperLimit={upperLimit}
      orientation={orientation}
      customTrack={Track !== undefined}
      onValueChange={valueHandler(handleValueChange)}
      onLeftValueChange={valueHandler(handleLeftValueChange)}
      onRightValueChange={valueHandler(handleRightValueChange)}>
      {Track ? (
        <View collapsable={false} pointerEvents="none">
          <Track />
        </View>
      ) : null}
      {Thumb ? 
        thumbValues.map((thumbValue, thumbIndex) => (
          <View key={thumbIndex} collapsable={false} pointerEvents="none">
            <Thumb
              index={stepIndex(thumbValue, minimumValue, maximumValue, step)}
            />
          </View>
        )) : null}
    </RNCSliderNativeComponent>
  );
};

export default Slider;
