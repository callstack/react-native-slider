/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-pager-view', () => {
  const {View} = require('react-native');
  return ({children}: {children: React.ReactNode}) => <View>{children}</View>;
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
