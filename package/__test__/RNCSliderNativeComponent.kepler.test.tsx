import React from 'react';
import {act, fireEvent, render} from '@testing-library/react-native';
import {StyleSheet} from 'react-native';

// React Native core has no useTVEventHandler: the mock keeps the component's handler,
// and the tests press remote keys through it.
let mockKeyHandler:
  | ((event: {eventType: string; eventKeyAction?: number}) => void)
  | null = null;
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  return Object.setPrototypeOf(
    {
      useTVEventHandler: (handler: typeof mockKeyHandler) => {
        mockKeyHandler = handler;
      },
    },
    ReactNative,
  );
});

import RNCSliderKepler from '../src/RNCSliderNativeComponent.kepler';

const press = (eventType: string) =>
  act(() => {
    mockKeyHandler?.({eventType, eventKeyAction: 0});
  });
const release = (eventType: string) =>
  act(() => {
    mockKeyHandler?.({eventType, eventKeyAction: 1});
  });

function setup(
  props: Partial<React.ComponentProps<typeof RNCSliderKepler>> = {},
) {
  const events: Array<[string, number]> = [];
  const screen = render(
    <RNCSliderKepler
      testID="slider"
      value={5}
      minimumValue={0}
      maximumValue={10}
      step={1}
      onRNCSliderSlidingStart={(e) =>
        events.push(['start', e.nativeEvent.value])
      }
      onRNCSliderValueChange={(e) =>
        events.push(['change', e.nativeEvent.value])
      }
      onRNCSliderSlidingComplete={(e) =>
        events.push(['complete', e.nativeEvent.value])
      }
      {...props}
    />,
  );
  const slider = screen.getByTestId('slider');
  const focus = () => act(() => fireEvent(slider, 'focus'));
  const now = () => slider.props.accessibilityValue.now;
  return {screen, slider, events, focus, now};
}

beforeEach(() => {
  mockKeyHandler = null;
});

test('is an adjustable control with its range and value for VoiceView', () => {
  const {slider} = setup();
  expect(slider.props.accessibilityRole).toBe('adjustable');
  expect(slider.props.accessibilityValue).toEqual({
    min: 0,
    max: 10,
    now: 5,
    text: '5',
  });
});

test('gives VoiceView the value as text, so 53 is not read as "53.0"', () => {
  const {slider} = setup({value: 0.1 + 0.2, step: 0.1, maximumValue: 1});
  expect(slider.props.accessibilityValue.text).toBe('0.3');
});

test('right and left change the value by one step while the slider has focus', () => {
  const {events, focus, now} = setup();
  focus();
  press('right');
  press('right');
  release('right');
  press('left');
  release('left');
  expect(now()).toBe(6);
  expect(events).toEqual([
    ['start', 5],
    ['change', 6],
    ['change', 7],
    ['complete', 7],
    ['start', 7],
    ['change', 6],
    ['complete', 6],
  ]);
});

test("the app's own onFocus and onBlur still run", () => {
  const onFocus = jest.fn();
  const onBlur = jest.fn();
  const {slider, focus} = setup({onFocus, onBlur} as never);
  focus();
  act(() => fireEvent(slider, 'blur'));
  expect(onFocus).toHaveBeenCalledTimes(1);
  expect(onBlur).toHaveBeenCalledTimes(1);
});

test('keys do nothing while another control has focus', () => {
  const {events, now} = setup();
  press('right');
  release('right');
  expect(now()).toBe(5);
  expect(events).toEqual([]);
});

test('other keys are left to the app', () => {
  const {events, focus} = setup();
  focus();
  press('up');
  press('select');
  expect(events).toEqual([]);
});

test('the value stays inside the range and inside lowerLimit / upperLimit', () => {
  const {events, focus, now} = setup({
    value: 9,
    lowerLimit: 2,
    upperLimit: 9.5,
  });
  focus();
  press('right');
  release('right');
  expect(now()).toBe(9);
  expect(events).toEqual([
    ['start', 9],
    ['complete', 9],
  ]);
});

test('the value stays on the step grid at a lowerLimit between two steps', () => {
  const {focus, now} = setup({value: 3, lowerLimit: 2.5});
  focus();
  press('left');
  expect(now()).toBe(3);
});

test('inverted: right moves towards the minimum', () => {
  const {focus, now} = setup({inverted: true});
  focus();
  press('right');
  expect(now()).toBe(4);
});

test('without a step one key press moves 1 % of the range', () => {
  const {focus, now} = setup({
    step: 0,
    value: 0.5,
    minimumValue: 0,
    maximumValue: 1,
  });
  focus();
  press('right');
  press('right');
  expect(now()).toBe(0.52);
});

test('a disabled slider takes no focus and ignores keys', () => {
  const {slider, focus, events, now} = setup({disabled: true});
  expect(slider.props.focusable).toBe(false);
  focus();
  press('right');
  expect(now()).toBe(5);
  expect(events).toEqual([]);
});

test('losing focus in the middle of a key press completes the slide', () => {
  const {slider, events, focus} = setup();
  focus();
  press('right');
  act(() => fireEvent(slider, 'blur'));
  expect(events).toEqual([
    ['start', 5],
    ['change', 6],
    ['complete', 6],
  ]);
});

test('VoiceView increment and decrement move one step', () => {
  const {slider, events, now} = setup();
  act(() =>
    fireEvent(slider, 'accessibilityAction', {
      nativeEvent: {actionName: 'increment'},
    }),
  );
  expect(now()).toBe(6);
  act(() =>
    fireEvent(slider, 'accessibilityAction', {
      nativeEvent: {actionName: 'decrement'},
    }),
  );
  expect(now()).toBe(5);
  expect(events).toEqual([
    ['start', 5],
    ['change', 6],
    ['complete', 6],
    ['start', 6],
    ['change', 5],
    ['complete', 5],
  ]);
});

test('a new value from the app moves the slider without change events', () => {
  const {screen, events, now} = setup();
  screen.rerender(
    <RNCSliderKepler
      testID="slider"
      value={8}
      minimumValue={0}
      maximumValue={10}
      step={1}
    />,
  );
  expect(now()).toBe(8);
  expect(events).toEqual([]);
});

test('touch: the value follows the finger on the track', () => {
  const {screen, events, now} = setup();
  const track = screen.getByTestId('slider-track');
  // 220 px track with a 20 px thumb: the thumb centre runs from x = 10 to x = 210.
  act(() =>
    fireEvent(track, 'layout', {
      nativeEvent: {layout: {width: 220, height: 40}},
    }),
  );
  act(() =>
    fireEvent(track, 'responderGrant', {nativeEvent: {locationX: 110}}),
  );
  act(() => fireEvent(track, 'responderMove', {nativeEvent: {locationX: 190}}));
  act(() =>
    fireEvent(track, 'responderRelease', {nativeEvent: {locationX: 190}}),
  );
  expect(now()).toBe(9);
  expect(events).toEqual([
    ['start', 5],
    ['change', 9],
    ['complete', 9],
  ]);
});

test('touch: the value snaps to the nearest step counted from the minimum', () => {
  // Steps 1 and 3 (minimumValue 1, step 2). x = 70 is 1.9: nearer to 1 than to 3.
  const {screen, now} = setup({
    value: 3,
    minimumValue: 1,
    maximumValue: 4,
    step: 2,
  });
  const track = screen.getByTestId('slider-track');
  act(() =>
    fireEvent(track, 'layout', {
      nativeEvent: {layout: {width: 220, height: 40}},
    }),
  );
  act(() => fireEvent(track, 'responderGrant', {nativeEvent: {locationX: 70}}));
  act(() =>
    fireEvent(track, 'responderRelease', {nativeEvent: {locationX: 70}}),
  );
  expect(now()).toBe(1);
});

test('the thumb is 16 dp, 20 dp with focus: Vega lays out the TV screen as 960x540 dp', () => {
  const {screen, focus} = setup();
  const size = () =>
    StyleSheet.flatten(screen.getByTestId('slider-thumb').props.style).width;
  expect(size()).toBe(16);
  focus();
  expect(size()).toBe(20);
});

test('thumbSize sets the thumb, and focus adds 4 dp', () => {
  const {screen, focus} = setup({thumbSize: 12});
  const size = () =>
    StyleSheet.flatten(screen.getByTestId('slider-thumb').props.style).width;
  expect(size()).toBe(12);
  focus();
  expect(size()).toBe(16);
});
