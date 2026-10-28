import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import RCTSliderWebComponent from '../src/RNCSliderNativeComponent.web';

// Only the props relevant to the tests are passed
const WebSlider = RCTSliderWebComponent as React.ComponentType<any>;

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

  // Without a layout the track is 1px wide and starts at x = 0,
  // so `pageX` is the fraction of the track left of the touch
  const releaseAt = (props: object, pageX: number) => {
    const onSlidingComplete = jest.fn();
    const {getByTestId} = render(
      <WebSlider
        testID="slider"
        onRNCSliderSlidingComplete={onSlidingComplete}
        {...props}
      />,
    );
    fireEvent(getByTestId('slider'), 'responderRelease', {
      nativeEvent: {pageX},
    });
    return onSlidingComplete.mock.calls[0][0].nativeEvent.value;
  };

  // Accessibility actions don't report a value change, so the value is
  // read from the sliding start event that the next touch emits
  const valueAfterAction = (props: object, actionName: string) => {
    const onSlidingStart = jest.fn();
    const {getByTestId} = render(
      <WebSlider
        testID="slider"
        onRNCSliderSlidingStart={onSlidingStart}
        {...props}
      />,
    );
    fireEvent(getByTestId('slider'), 'accessibilityAction', {
      nativeEvent: {actionName},
    });
    fireEvent(getByTestId('slider'), 'responderGrant');
    return onSlidingStart.mock.calls[0][0].nativeEvent.value;
  };

  it('Counts steps from the minimum value', () => {
    const props = {
      minimumValue: 1,
      maximumValue: 10,
      lowerLimit: 1,
      upperLimit: 10,
      step: 2,
    };
    // 1 + 9 * 0.25 = 3.25, the nearest step is 3
    expect(releaseAt(props, 0.25)).toBe(3);
    // 1 + 9 * 0.5 = 5.5, the nearest step is 5
    expect(releaseAt(props, 0.5)).toBe(5);
  });

  it('Counts steps from the minimum value when inverted', () => {
    const props = {
      minimumValue: 1,
      maximumValue: 10,
      lowerLimit: 1,
      upperLimit: 10,
      step: 2,
      inverted: true,
    };
    // 10 - 9 * 0.75 = 3.25, the nearest step is 3
    expect(releaseAt(props, 0.75)).toBe(3);
  });

  it('Counts accessibility action steps from the minimum value', () => {
    const props = {
      value: 5,
      minimumValue: 1,
      maximumValue: 13,
      lowerLimit: 1,
      upperLimit: 13,
      step: 3,
    };
    // 5 + 3 = 8, the nearest step is 7
    expect(valueAfterAction(props, 'increment')).toBe(7);
    // 5 - 3 = 2, the nearest step is 1
    expect(valueAfterAction(props, 'decrement')).toBe(1);
  });
});
