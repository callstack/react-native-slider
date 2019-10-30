/* @flow */

import * as React from 'react';
import renderer from 'react-test-renderer';
import Slider from '../Slider';

describe('<Slider />', () => {
  it('renders enabled slider', () => {
    const tree = renderer.create(<Slider />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders disabled slider', () => {
    const tree = renderer.create(<Slider disabled />).toJSON();

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
        />,
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
