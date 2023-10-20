import React from 'react';
import {StyleProp, Text, TextStyle, View} from 'react-native';
import {styles} from '../utils/styles';

export const StepNumber = ({
  i,
  style,
}: {
  i: number;
  style: StyleProp<TextStyle>;
}) => {
  return (
    <View style={styles.stepNumber}>
      <Text style={style}>{i}</Text>
    </View>
  );
};
