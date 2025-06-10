import {render, screen} from '@testing-library/react-native';
import * as React from 'react';
import renderer from 'react-test-renderer';
import Slider from '../Slider';
import {View} from 'react-native';

describe('<Slider />', () => {
  it('renders enabled slider', () => {
    render(<Slider />);

    expect(screen).toMatchSnapshot();
  });

  it('renders disabled slider', () => {
    render(<Slider disabled />);

    expect(screen).toMatchSnapshot();
  });

  it('accessibilityState disabled sets disabled={true}', () => {
    render(<Slider accessibilityState={{disabled: true}} />);

    expect(screen).toMatchSnapshot();
  });

  it('disabled prop overrides accessibilityState.disabled', () => {
    render(<Slider disabled accessibilityState={{disabled: false}} />);

    expect(screen).toMatchSnapshot();
  });

  it('disabled prop overrides accessibilityState.enabled', () => {
    render(<Slider disabled={false} accessibilityState={{disabled: true}} />);

    expect(screen).toMatchSnapshot();
  });

  it('renders a slider with custom props', () => {
    render(
      <Slider
        value={0.5}
        minimumValue={-1}
        maximumValue={2}
        step={0.25}
        minimumTrackTintColor={'blue'}
        maximumTrackTintColor={'red'}
        thumbTintColor={'green'}
        onSlidingComplete={() => {}}
        onValueChange={() => {}}
        lowerLimit={0}
        upperLimit={1}
      />,
    );

    expect(screen).toMatchSnapshot();
  });

  it('renders a slider with custom stepMaker', () => {
    render(
      <Slider
        value={2}
        minimumValue={0}
        maximumValue={4}
        StepMarker={({stepMarked}) => {
          return stepMarked ? (
            <View>
              <View style={{width: 10, backgroundColor: 'red'}} />
            </View>
          ) : (
            <View>
              <View style={{width: 10, backgroundColor: 'green'}} />
            </View>
          );
        }}
      />,
    );

    expect(screen).toMatchSnapshot();
  });

    expect(tree).toMatchSnapshot();
  });
});
