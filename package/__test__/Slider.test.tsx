import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import Slider from '../src/Slider';

describe('Slider', () => {
  it('Calls the given onValueChange when native event is emitted', () => {
    const onValueChange = jest.fn();
    const {getByTestId} = render(
      <Slider testID="slider" onValueChange={onValueChange} />,
    );
    const slider = getByTestId('slider');
    fireEvent(slider, 'change', {nativeEvent: {value: 2}});
    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it('Handles provided events when sliding starts is emitted', () => {
    const onSlidingStart = jest.fn();
    const {getByTestId} = render(
      <Slider testID="slider" onSlidingStart={onSlidingStart} />,
    );
    const slider = getByTestId('slider');

    fireEvent(slider, 'onRNCSliderSlidingStart', {nativeEvent: {value: 2}});
    expect(onSlidingStart).toHaveBeenCalledWith(2);
  });

  it('Handles provided events when sliding end is emitted', () => {
    const onSlidingComplete = jest.fn();
    const {getByTestId} = render(
      <Slider testID="slider" onSlidingComplete={onSlidingComplete} />,
    );
    const slider = getByTestId('slider');

    fireEvent(slider, 'onRNCSliderSlidingComplete', {nativeEvent: {value: 2}});
    expect(onSlidingComplete).toHaveBeenCalledWith(2);
  });

  it('Calls the accessibility handler when accessibility action is triggered', () => {
    const mockedAccessibilityHandler = jest.fn();
    const {getByTestId} = render(
      <Slider
        testID="slider"
        onAccessibilityAction={mockedAccessibilityHandler}
      />,
    );
    const slider = getByTestId('slider');

    fireEvent(slider, 'onRNCSliderAccessibilityAction', {
      actionName: 'mocked-action',
    });
    expect(mockedAccessibilityHandler).toHaveBeenCalledWith({
      actionName: 'mocked-action',
    });
  });

  it('Emitts a warning in the dev console if lower and upper limits are switched', () => {
    const mockedWarn = jest.fn();
    console.warn = mockedWarn;
    render(<Slider testID="slider" lowerLimit={10} upperLimit={2} />);
    expect(mockedWarn).toHaveBeenCalled();
  });

  it('Provides the onLayout with the measured width', () => {
    const {getByTestId} = render(<Slider testID="slider" />);
    const slider = getByTestId('slider');
    fireEvent(slider, 'onLayout', {nativeEvent: {layout: {width: 200}}});
    expect(slider).toHaveStyle({width: 200});
  });

  it('Prevents the gesture control from being released externally', () => {
    const mockedRelease = jest.fn();
    jest.mock('../src/index', () => ({
      ...jest.requireActual('../src/index'),
      onResponderRelease: mockedRelease,
    }));
    const {getByTestId} = render(<Slider testID="slider" />);
    fireEvent(getByTestId('slider'), 'onResponderTerminationRequest');
    expect(mockedRelease).not.toHaveBeenCalled();
  });
});
