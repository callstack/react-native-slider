import React from 'react';
import Slider from '@react-native-community/slider';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

const App = () => {
  return (
      <View>
        <Slider
          step={1}
          maximumValue={3}
          minimumValue={0}
          style={styles.slider}
          value={1}
          disabled
        />
        <Text testID="testTextId" style={styles.title}>
        </Text>
      </View>
  );
}

export default App;

const styles = StyleSheet.create({
  slider: {
    width: '100%',
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
