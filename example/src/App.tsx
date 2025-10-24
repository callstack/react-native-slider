import React, {useState} from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';

const App = () => {
  const backgroundImage = Image.resolveAssetSource(require('./resources/Light.png'));

  return (
    <ImageBackground source={backgroundImage} style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.introText}>Slider can be used in various scenarios...</Text>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default App;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  introText: {
    textAlign: "center",
    fontFamily: "Allience No.2"
  },
});
