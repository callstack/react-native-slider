import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import Slider from '../src/Slider';

describe('Slider', () => {
  it('Calls the given onValueChange when the native event is emitted', () => {
    const onValueChange = jest.fn();
    const {getByTestId} = render(
      <Slider testID="slider" onValueChange={onValueChange} />,
    );

    fireEvent(getByTestId('slider'), 'valueChange', {nativeEvent: {value: 2}});

    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it('Does not pass a handler down to the native component when none is given', () => {
    const {getByTestId} = render(<Slider testID="slider" />);

    expect(getByTestId('slider').props.onValueChange).toBeUndefined();
  });

  it('Forwards the range and the value to the native component', () => {
    const {getByTestId} = render(
      <Slider testID="slider" minimumValue={5} maximumValue={25} value={10} />,
    );
    const slider = getByTestId('slider');

    expect(slider.props.minimumValue).toBe(5);
    expect(slider.props.maximumValue).toBe(25);
    expect(slider.props.value).toBe(10);
  });

  it('Falls back to the default range and value', () => {
    const {getByTestId} = render(<Slider testID="slider" />);
    const slider = getByTestId('slider');

    expect(slider.props.minimumValue).toBe(0);
    expect(slider.props.maximumValue).toBe(1);
    expect(slider.props.value).toBe(0);
  });
});
