import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {examples} from './Examples';

const App = () => {
  return (
    <SafeAreaView style={styles.homeScreenContainer}>
      <View>
        <Text testID="testTextId" style={styles.title}>
          {'Examples'}
        </Text>
      </View>
      <View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}>
          {examples.map((e, i) => (
            <View key={`slider${i}`} style={styles.sliderWidget}>
              <Text style={styles.instructions}>{e.title}</Text>
              {e.render()}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
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
  slider: {
    width: '100%' as const,
  },
  pagerViewContainer: {
    flex: 1,
  },
  homeScreenContainer: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: '#F5FCFF',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
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
