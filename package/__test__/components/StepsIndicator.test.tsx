import React from 'react';
import {render} from '@testing-library/react-native';
import {StepsIndicator} from '../../src/components/StepsIndicator';
import {constants} from '../../src/utils/constants';
import {Platform} from 'react-native';
import {styles} from '../../src/utils/styles';

const defaultOptions = [0, 1, 2, 3, 4, 5];
const longerOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('StepsIndicator', () => {
  it('Renders every step provided in options', () => {
    const {getByText} = render(
      <StepsIndicator
        options={defaultOptions}
        sliderWidth={20}
        currentValue={0}
        renderStepNumber
      />,
    );
    for (const step of defaultOptions) {
      expect(getByText(step.toString())).toBeDefined();
    }
  });

  it('Applies the big font size to the lower number of steps', () => {
    const {getByTestId} = render(
      <StepsIndicator
        options={defaultOptions}
        sliderWidth={20}
        currentValue={0}
        renderStepNumber
      />,
    );
    expect(getByTestId('0th-step')).toHaveStyle({
      fontSize: constants.STEP_NUMBER_TEXT_FONT_BIG,
    });
  });

  it('Applies the small font size to the number of steps higher than 9', () => {
    const {getByTestId} = render(
      <StepsIndicator
        options={longerOptions}
        sliderWidth={20}
        currentValue={0}
        renderStepNumber
      />,
    );
    expect(getByTestId('0th-step')).toHaveStyle({
      fontSize: constants.STEP_NUMBER_TEXT_FONT_SMALL,
    });
  });

  it('Applies platform-dependent styles for web', () => {
    Platform.OS = 'web';
    const {getByTestId} = render(
      <StepsIndicator
        options={longerOptions}
        sliderWidth={20}
        currentValue={0}
        renderStepNumber
      />,
    );
    expect(getByTestId('StepsIndicator-Container')).toHaveStyle(
      styles.stepsIndicator,
    );
  });

  it('Reverts given options when isLTR is set', () => {
    const {getByTestId} = render(
      <StepsIndicator
        options={defaultOptions}
        sliderWidth={20}
        currentValue={0}
        renderStepNumber
        isLTR
      />,
    );
    expect(getByTestId('0th-step')).toHaveTextContent('5');
    expect(getByTestId('2th-step')).toHaveTextContent('3');
  });

  it('Does not display any step numbers if prop is not set', () => {
    const {queryByTestId} = render(
      <StepsIndicator
        options={defaultOptions}
        sliderWidth={20}
        currentValue={0}
      />,
    );
    expect(queryByTestId('0th-step')).toBeFalsy();
  });
});
