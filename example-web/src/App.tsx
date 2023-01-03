import React from 'react';
import {
  Text,
  View,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';

import {examples, Props as ExamplesTabProperties} from './Examples';
import {propsExamples, Props as PropsTabProperties} from './Props';

function App() {
  const renderExampleTab = (
    sliders: PropsTabProperties[] | ExamplesTabProperties[],
    filtered?: boolean,
  ) => {
    return (
      <View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}>
          {(filtered
            ? (sliders as ExamplesTabProperties[]).filter(
                e => !e.platform || e.platform === Platform.OS,
              )
            : sliders
          ).map((e, i) => (
            <View key={`slider${i}`} style={styles.sliderWidget}>
              <Text style={styles.instructions}>{e.title}</Text>
              {e.render()}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <View style={{ width: '100%', margin: 'auto' }}>
          {renderExampleTab(examples, true)}
          {renderExampleTab(propsExamples)}
        </View>
      </header>
    </div>
  );
}

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
