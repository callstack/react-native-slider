import * as React from 'react';
import renderer from 'react-test-renderer';
import Slider from '../Slider';
import {View} from 'react-native';

describe('<Slider />', () => {
  it('renders enabled slider', () => {
    const tree = renderer.create(<Slider />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders disabled slider', () => {
    const tree = renderer.create(<Slider disabled />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('accessibilityState disabled sets disabled={true}', () => {
    const tree = renderer
      .create(<Slider accessibilityState={{disabled: true}} />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('disabled prop overrides accessibilityState.disabled', () => {
    const tree = renderer
      .create(<Slider disabled accessibilityState={{disabled: false}} />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('disabled prop overrides accessibilityState.enabled', () => {
    const tree = renderer
      .create(<Slider disabled={false} accessibilityState={{disabled: true}} />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders a slider with custom props', () => {
    const tree = renderer
      .create(
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
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders a slider with custom stepMaker', () => {
    const tree = renderer
      .create(
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
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
