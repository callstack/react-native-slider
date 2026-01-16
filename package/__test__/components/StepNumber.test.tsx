import React from 'react';
import {render} from '@testing-library/react-native';
import {StepNumber} from '../../src/components/StepNumber';

describe('StepNumber', () => {
  it('Displays number of step according to given index', () => {
    const {getByText} = render(<StepNumber i={0} style={undefined} />);
    expect(getByText('0')).toBeDefined();
  });
});
