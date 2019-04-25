/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {StyleSheet, Text, ScrollView, View} from 'react-native';
import {examples} from './SliderExample';

type Props = {};
export default class App extends Component<Props> {
  render() {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}>
        <Text testID="testTextId" style={styles.title}>{'<Slider />'}</Text>
        {examples.map((e, i) => (
          <View key={`slider${i}`}>
            <Text>{e.title}</Text>
            {e.render()}
          </View>
        ))}
      </ScrollView>
    );
  }
}

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
  },
});
