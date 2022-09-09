import React from 'react';
import {Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import {examples} from './SliderExample';

const App = () => {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}>
      <Text testID="testTextId" style={styles.title}>
        {'<Slider />'}
      </Text>
      {examples
        .filter(e => !e.platform || e.platform === Platform.OS)
        .map((e, i) => (
          <View key={`slider${i}`} style={styles.sliderWidget}>
            <Text style={styles.instructions}>{e.title}</Text>
            {e.render()}
          </View>
        ))}
    </ScrollView>
  );
};

export default App;

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#F5FCFF',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
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
