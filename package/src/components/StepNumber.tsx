import React from 'react';
import {StyleProp, Text, TextStyle, View} from 'react-native';
import {styles} from '../utils/styles';

export const StepNumber = ({
  i,
  index,
  style,
}: {
  i: number;
  index: number;
  style: StyleProp<TextStyle>;
}) => {
  return (
    <View style={styles.stepNumber}>
      <Text testID={`${index}th-step`} style={style}>
        {i}
      </Text>
    </View>
  );
};
