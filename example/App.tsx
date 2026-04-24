/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import Slider from '@react-native-community/slider';
import { NewAppScreen } from '@react-native/new-app-screen';
import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [sliderValue, setSliderValue] = useState(0);
  const safeAreaInsets = useSafeAreaInsets();

  console.log("BLA");
  return (
    <View style={styles.container}>
     <Slider
      minimumValue={0}
      maximumValue={20}
      value={sliderValue}
      step={2}
      style={styles.slider}
      onValueChange={(value) => {
        console.log('value', value);
      }}
     />
     <Text>{sliderValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  stepMarker: {
    backgroundColor: 'red',
    width: 10,
    height: 10,
  },
  slider: {
    color: 'red',
    width: '70%',
    height: 40,
  },
});

export default App;
