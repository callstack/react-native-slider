import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {examples} from './Examples';

const App = () => {
  return (
    <View style={styles.container}>
      <Text testID="testTextId" style={styles.title}>
        {'Examples'}
      </Text>
      <ScrollView style={styles.scrollView}>
        {examples.map((e, i) => (
          <View key={`slider${i}`} style={styles.sliderWidget}>
            <Text style={styles.instructions}>{e.title}</Text>
            {e.render()}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default App;

const pageViewPositionSlider = {
  trackColor: '#ABABAB',
  thumbColor: '#1411AB',
  style: {
    width: '100%',
  },
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#F5FCFF',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    color: pageViewPositionSlider.thumbColor,
    textAlign: 'center',
    width: '100%',
    marginVertical: 20,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
    fontSize: 20,
  },
  sliderWidget: {
    marginVertical: 30,
  },
});
