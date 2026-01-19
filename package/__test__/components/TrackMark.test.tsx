import React from 'react';
import {render} from '@testing-library/react-native';
import {MarkerProps, SliderTrackMark} from '../../src/components/TrackMark';
import {View} from 'react-native';

const MockedStepMarker = ({}: MarkerProps) => (
  <View testID="mockedStepMarker" />
);

const MockedThumbImage = 1;

describe('TrackMark', () => {
  it('Renders the StepMarker if custom component is given', () => {
    const {getByTestId} = render(
      <SliderTrackMark
        StepMarker={MockedStepMarker}
        isTrue={false}
        index={0}
        currentValue={0}
        min={0}
        max={0}
      />,
    );
    expect(getByTestId('mockedStepMarker')).toBeDefined();
  });

  it('Renders the StepMarker with thumbImage if provided', () => {
    const {getByTestId} = render(
      <SliderTrackMark
        thumbImage={MockedThumbImage}
        StepMarker={MockedStepMarker}
        isTrue={true}
        index={0}
        currentValue={0}
        min={0}
        max={0}
      />,
    );
    expect(getByTestId('sliderTrackMark-thumbImage')).toBeDefined();
  });
});
