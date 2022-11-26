import React, {useState} from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {examples} from './Examples';
import PagerView from 'react-native-pager-view';
import Slider from '@react-native-community/slider';

const App = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const titles = ['Examples'];

  return (
    <SafeAreaView style={styles.homeScreenContainer}>
      <View>
        <Slider
          step={1}
          maximumValue={3}
          minimumValue={0}
          style={pageViewPositionSlider.style}
          value={currentPage + 1}
          thumbTintColor={pageViewPositionSlider.thumbColor}
          disabled
          maximumTrackTintColor={pageViewPositionSlider.trackColor}
          minimumTrackTintColor={pageViewPositionSlider.trackColor}
        />
        <Text testID="testTextId" style={styles.title}>
          {titles[currentPage]}
        </Text>
      </View>
      <PagerView
        initialPage={0}
        style={styles.pagerViewContainer}
        onPageSelected={e => {
          setCurrentPage(e.nativeEvent.position);
        }}>
        <View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.container}>
            {examples
              .filter(e => !e.platform || e.platform === Platform.OS)
              .map((e, i) => (
                <View key={`slider${i}`} style={styles.sliderWidget}>
                  <Text style={styles.instructions}>{e.title}</Text>
                  {e.render()}
                </View>
              ))}
          </ScrollView>
        </View>
      </PagerView>
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
