import React, {useState} from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { createStaticNavigation, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Section from './components/Sections';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
}

const backgroundImage = Image.resolveAssetSource(require("./resources/Light.png"));
const tabBarBackgroundImage = Image.resolveAssetSource(require('./resources/opensource_logo_16.png'));

const RootStack = createBottomTabNavigator({
  screenOptions: {
    tabBarStyle: {
      height: 90,
      paddingBottom: 0,
      shadowColor: "transparent",
    },
    tabBarItemStyle: {
      height: 40,
      justifyContent: "center",
      alignContent: "center",
      alignSelf: "center",
    },
    header: (props) => (
      <View style={styles.headerContainer}>
        <Text>{props.route.name}</Text>
      </View>
    ),
    tabBarBackground: () => (
      <View style={styles.bottomContainer}>
        <Image source={tabBarBackgroundImage} style={styles.logo} />
      </View>
    )
  },
  screens: {
    Home: HomeScreen,
  },
});

const sharedTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

const Navigation = createStaticNavigation(RootStack);

const App = () => {

  return (
    <SafeAreaProvider>
      <ImageBackground source={backgroundImage} style={styles.mainContainer}>
        <Navigation theme={sharedTheme}/>
      </ImageBackground>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    padding: 5,
    alignItems: "center",
  },
  logo: {
    height: 20,
    width: "60%",
  },
  safeArea: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  introText: {
    textAlign: "center",
    fontFamily: "AllianceNo2-Bold",
    fontSize: 22,
    color: "#cfced5",
    opacity: 1
  },
});
