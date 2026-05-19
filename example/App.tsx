/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import Slider from "@react-native-community/slider";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

function App() {
  return (
      <AppContent />
  );
}

function AppContent() {
  const [sliderValue, setSliderValue] = useState(0);

  return (
    <View style={styles.container}>
      <Text>{sliderValue.toFixed(2)}</Text>
      <Slider
        onValueChange={(value) => {
          setSliderValue(value);
          console.log('value', value);
        }}
        step={5}
        minValue={50}
        maxValue={100}
        style={{
          padding: 20,
          width: "80%",
          height: 40,
          backgroundColor: "transparent",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  stepMarker: {
    backgroundColor: "red",
    width: 10,
    height: 10,
  },
  slider: {
    color: "red",
    width: "70%",
    height: 40,
  },
});

export default App;
