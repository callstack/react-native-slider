import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {Text} from 'react-native';

import Slider, {type MarkerProps} from '../src/Slider';

describe('Slider', () => {
  it('maps public value props to native prop names', () => {
    const {getByTestId} = render(
      <Slider
        testID="slider"
        minimumValue={2}
        maximumValue={10}
        lowerLimit={3}
        upperLimit={9}
        value={4}
        step={2}
        disabled
        inverted
        tapToSeek
        thumbTintColor="red"
      />,
    );

    expect(getByTestId('slider')).toHaveProp('minValue', 2);
    expect(getByTestId('slider')).toHaveProp('maxValue', 10);
    expect(getByTestId('slider')).toHaveProp('lowerLimit', 3);
    expect(getByTestId('slider')).toHaveProp('upperLimit', 9);
    expect(getByTestId('slider')).toHaveProp('value', 4);
    expect(getByTestId('slider')).toHaveProp('step', 2);
    expect(getByTestId('slider')).toHaveProp('disabled', true);
    expect(getByTestId('slider')).toHaveProp('inverted', true);
    expect(getByTestId('slider')).toHaveProp('tapToSeek', true);
    expect(getByTestId('slider')).toHaveProp('thumbTintColor', 'red');
  });

  it('keeps minValue and maxValue as compatibility aliases', () => {
    const {getByTestId} = render(
      <Slider testID="slider" minValue={5} maxValue={15} />,
    );

    expect(getByTestId('slider')).toHaveProp('minValue', 5);
    expect(getByTestId('slider')).toHaveProp('maxValue', 15);
  });

  it('forwards native value events with numeric values', () => {
    const onValueChange = jest.fn();
    const onSlidingStart = jest.fn();
    const onSlidingComplete = jest.fn();
    const {getByTestId} = render(
      <Slider
        testID="slider"
        onValueChange={onValueChange}
        onSlidingStart={onSlidingStart}
        onSlidingComplete={onSlidingComplete}
      />,
    );

    fireEvent(getByTestId('slider'), 'onValueChange', {
      nativeEvent: {value: 0.25},
    });
    fireEvent(getByTestId('slider'), 'onSlidingStart', {
      nativeEvent: {value: 0.5},
    });
    fireEvent(getByTestId('slider'), 'onSlidingComplete', {
      nativeEvent: {value: 0.75},
    });

    expect(onValueChange).toHaveBeenCalledWith(0.25);
    expect(onSlidingStart).toHaveBeenCalledWith(0.5);
    expect(onSlidingComplete).toHaveBeenCalledWith(0.75);
  });

  it('passes accessibility actions through unchanged', () => {
    const onAccessibilityAction = jest.fn();
    const event = {nativeEvent: {actionName: 'increment'}};
    const {getByTestId} = render(
      <Slider
        testID="slider"
        onAccessibilityAction={onAccessibilityAction}
      />,
    );

    fireEvent(getByTestId('slider'), 'onAccessibilityAction', event);

    expect(onAccessibilityAction).toHaveBeenCalledWith(event);
  });

  it('warns when lowerLimit is greater than upperLimit', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<Slider lowerLimit={10} upperLimit={2} />);

    expect(warn).toHaveBeenCalledWith(
      'Invalid configuration: lower limit is supposed to be smaller than upper limit',
    );

    warn.mockRestore();
  });

  it('renders step numbers and custom markers', () => {
    const StepMarker = jest.fn(({index, stepMarked}: MarkerProps) => (
      <Text testID={`marker-${index}`}>{stepMarked ? 'selected' : 'idle'}</Text>
    ));

    const {getByTestId} = render(
      <Slider
        testID="slider"
        minimumValue={0}
        maximumValue={2}
        value={1}
        step={1}
        renderStepNumber
        StepMarker={StepMarker}
      />,
    );

    expect(getByTestId('StepsIndicator-Container')).toBeTruthy();
    expect(getByTestId('0th-step')).toHaveTextContent('0');
    expect(getByTestId('1th-step')).toHaveTextContent('1');
    expect(getByTestId('2th-step')).toHaveTextContent('2');
    expect(getByTestId('marker-1')).toHaveTextContent('selected');
    expect(getByTestId('slider')).toHaveProp('thumbTintColor', 'transparent');
    expect(StepMarker).toHaveBeenCalledWith(
      expect.objectContaining({
        currentValue: 1,
        index: 1,
        max: 2,
        min: 0,
        stepMarked: true,
      }),
      undefined,
    );
  });
});
