import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import RCTSliderWebComponent from '../src/RNCSliderNativeComponent.web';

// Only the props relevant to the tests are passed
const WebSlider = RCTSliderWebComponent as React.ComponentType<any>;

const renderWebSlider = (props: object) => {
  const onSlidingStart = jest.fn();
  const {getByTestId, toJSON} = render(
    <WebSlider
      testID="slider"
      onRNCSliderSlidingStart={onSlidingStart}
      {...props}
    />,
  );
  fireEvent(getByTestId('slider'), 'responderGrant');
  // The minimum track grows by the percentage of the range left of the thumb
  const minimumTrack = (toJSON() as any).children[0];
  return {onSlidingStart, thumbPercent: minimumTrack.props.style.flexGrow};
};

describe('RCTSliderWebComponent', () => {
  beforeAll(() => {
    // The web component subscribes to DOM events, which the
    // react-native test environment doesn't provide
    const listeners = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    Object.assign(global, listeners, {document: listeners});
  });

  it('Starts at 0 when value is 0 and the range includes negative values', () => {
    const {onSlidingStart, thumbPercent} = renderWebSlider({
      minimumValue: -8,
      maximumValue: 8,
      value: 0,
    });
    expect(onSlidingStart).toHaveBeenCalledWith({nativeEvent: {value: 0}});
    expect(thumbPercent).toBe(50);
  });

  it('Starts at 0 when no value is passed and the range includes 0', () => {
    // Slider passes `undefined` to the native component for `value={0}`
    const {onSlidingStart, thumbPercent} = renderWebSlider({
      minimumValue: -8,
      maximumValue: 8,
    });
    expect(onSlidingStart).toHaveBeenCalledWith({nativeEvent: {value: 0}});
    expect(thumbPercent).toBe(50);
  });

  it('Starts at the minimum value when 0 is below the range', () => {
    const {onSlidingStart, thumbPercent} = renderWebSlider({
      minimumValue: 2,
      maximumValue: 8,
      value: 0,
    });
    expect(onSlidingStart).toHaveBeenCalledWith({nativeEvent: {value: 2}});
    expect(thumbPercent).toBe(0);
  });

  it('Starts at the given non-zero value', () => {
    const {onSlidingStart, thumbPercent} = renderWebSlider({
      minimumValue: -8,
      maximumValue: 8,
      value: -4,
    });
    expect(onSlidingStart).toHaveBeenCalledWith({nativeEvent: {value: -4}});
    expect(thumbPercent).toBe(25);
  });
});
