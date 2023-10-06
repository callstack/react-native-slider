import React from 'react';
import {StyleProp, Text, TextStyle, View} from 'react-native';

export const StepNumber = ({
  i,
  style,
}: {
  i: number;
  style: StyleProp<TextStyle>;
}) => {
  return (
    <View style={{marginTop: 20, alignItems: 'center', position: 'absolute'}}>
      <Text style={style}>{i}</Text>
    </View>
  );
};
