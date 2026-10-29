import React, {useState} from "react";
import {View} from "react-native";
import type {NativeSyntheticEvent} from "react-native";
import RNCSliderNativeComponent from "./index";
import {type SliderProps} from "../typings";

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

/**
 * How many decimals it takes to write the given value out, capped at the
 * digits a double can be trusted with - see `snapped(to:)` on iOS.
 */
const decimals = (value: number) => {
  let count = 0;
  let scaled = Math.abs(value);

  while (count < 15 && scaled !== Math.floor(scaled)) {
    scaled *= 10;
    count += 1;
  }

  return count;
};

/**
 * Leeway, as a fraction of a step, for a value to count as landing on one.
 * Mirrored by the native step markers, which have to agree with JS on how
 * many steps there are.
 */
const STEP_TOLERANCE = 1e-9;

/**
 * The values the steps of a slider stand at, the way the native side lays
 * them out: every step from the minimum, and the maximum itself when the step
 * does not divide the range.
 */
const stepValues = (
  minimumValue: number,
  maximumValue: number,
  step: number,
) => {
  const span = maximumValue - minimumValue;
  if (step <= 0 || span <= 0) {
    return [];
  }

  const DECIMAL_FACTOR = 10;
  const scale = Math.pow(
    DECIMAL_FACTOR,
    Math.max(decimals(step), decimals(minimumValue)),
  );
  const wholeSteps = Math.floor(span / step + STEP_TOLERANCE);
  const values = Array.from(
    {length: wholeSteps + 1},
    (_, index) => Math.round((minimumValue + index * step) * scale) / scale,
  );

  if (span - wholeSteps * step > step * STEP_TOLERANCE) {
    values.push(maximumValue);
  }

  return values;
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
  stepMarkers = false,
  ...props
}: SliderProps) => {
  const StepMarker =
    typeof stepMarkers === "function" ? stepMarkers : undefined;
  const followsThumbs = Thumb !== undefined || StepMarker !== undefined;

  const [currentValue, setCurrentValue] = useThumbValue(value);
  const [currentValueLeft, setCurrentValueLeft] = useThumbValue(valueLeft);
  const [currentValueRight, setCurrentValueRight] = useThumbValue(valueRight);

  const handleValueChange = followsThumbs
    ? thumbValueHandler(setCurrentValue, onValueChange)
    : onValueChange;
  const handleLeftValueChange = followsThumbs
    ? thumbValueHandler(setCurrentValueLeft, onLeftValueChange)
    : onLeftValueChange;
  const handleRightValueChange = followsThumbs
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
      customThumb={Thumb !== undefined}
      stepMarkers={StepMarker ? "custom" : stepMarkers ? "native" : "none"}
      onValueChange={valueHandler(handleValueChange)}
      onLeftValueChange={valueHandler(handleLeftValueChange)}
      onRightValueChange={valueHandler(handleRightValueChange)}>
      {Track ? (
        <View collapsable={false} pointerEvents="none">
          <Track />
        </View>
      ) : null}
      {Thumb
        ? thumbValues.map((thumbValue, thumbIndex) => (
            <View key={thumbIndex} collapsable={false} pointerEvents="none">
              <Thumb
                index={stepIndex(thumbValue, minimumValue, maximumValue, step)}
              />
            </View>
          ))
        : null}
      {StepMarker
        ? stepValues(minimumValue, maximumValue, step).map(
            (stepValue, index) => (
              <View key={index} collapsable={false} pointerEvents="none">
                <StepMarker
                  index={index}
                  value={stepValue}
                  marked={thumbValues.some(
                    (thumbValue) =>
                      Math.abs(thumbValue - stepValue) <= step * STEP_TOLERANCE,
                  )}
                />
              </View>
            ),
          )
        : null}
    </RNCSliderNativeComponent>
  );
};

export default Slider;
