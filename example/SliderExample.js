/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

import React from 'react';
import { Text, StyleSheet, View, Image, Animated, I18nManager } from 'react-native';
import Slider, { ANDROID_DEFAULT_COLOR } from '@react-native-community/slider';
const AnimatedSlider = Animated.createAnimatedComponent(Slider);
import type { Element } from 'react';

class SliderExample extends React.Component<$FlowFixMeProps, $FlowFixMeState> {
  static defaultProps = {
    value: 0,
  };

  state = {
    value: this.props.value,
  };

  ref = React.createRef();

  setNativeProps(props) {
    this.getNode() && this.getNode().setNativeProps(props);
  }

  getNode() {
    return this.ref.current && this.ref.current.getNode();
  }

  render() {
    return (
      <View>
        <Text style={styles.text}>
          {this.state.value && +this.state.value.toFixed(3)}
        </Text>
        <AnimatedSlider
          {...this.props}
          ref={this.ref}
          onValueChange={value => this.setState({ value: value })}
        />
      </View>
    );
  }
}

class SlidingStartExample extends React.Component<
  $FlowFixMeProps,
  $FlowFixMeState,
  > {
  state = {
    slideStartingValue: 0,
    slideStartingCount: 0,
  };

  render() {
    return (
      <View>
        <SliderExample
          {...this.props}
          onSlidingStart={value =>
            this.setState({
              slideStartingValue: value,
              slideStartingCount: this.state.slideStartingCount + 1,
            })
          }
        />
        <Text>
          Starts: {this.state.slideStartingCount} Value:{' '}
          {this.state.slideStartingValue}
        </Text>
      </View>
    );
  }
}

class SlidingCompleteExample extends React.Component<
  $FlowFixMeProps,
  $FlowFixMeState,
  > {
  state = {
    slideCompletionValue: 0,
    slideCompletionCount: 0,
  };

  render() {
    return (
      <View>
        <SliderExample
          {...this.props}
          onSlidingComplete={value =>
            this.setState({
              slideCompletionValue: value,
              slideCompletionCount: this.state.slideCompletionCount + 1,
            })
          }
        />
        <Text>
          Completions: {this.state.slideCompletionCount} Value:{' '}
          {this.state.slideCompletionValue}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 10,
  },
});

exports.title = '<Slider>';
exports.displayName = 'SliderExample';
exports.description = 'Slider input for numeric values';
exports.examples = [
  {
    title: 'Default settings',
    render(): Element<any> {
      return <SliderExample />;
    },
  },
  {
    title: 'Initial value: 0.5',
    render(): Element<any> {
      return <SliderExample value={0.5} />;
    },
  },
  {
    title: 'minimumValue: -1, maximumValue: 2',
    render(): Element<any> {
      return <SliderExample minimumValue={-1} maximumValue={2} />;
    },
  },
  {
    title: 'step: 0.25',
    render(): Element<any> {
      return <SliderExample step={0.25} />;
    },
  },
  {
    title: 'onSlidingStart',
    render(): Element<any> {
      return <SlidingStartExample />;
    },
  },
  {
    title: 'onSlidingComplete',
    render(): Element<any> {
      return <SlidingCompleteExample />;
    },
  },
  {
    title: 'Custom min/max track tint color',
    render(): Element<any> {
      return (
        <SliderExample
          minimumTrackTintColor={'blue'}
          maximumTrackTintColor={'red'}
          value={0.5}
        />
      );
    },
  },
  {
    title: 'Custom thumb tint color',
    render(): Element<any> {
      return <SliderExample thumbTintColor={'blue'} />;
    },
  },
  {
    title: 'Custom thumb image',
    render(): Element<any> {
      return <SliderExample inverted thumbImage={require('./uie_thumb_big.png')} value={0.8} />;
    },
  },
  {
    title: 'Custom track image',
    platform: 'ios',
    render(): Element<any> {
      return <SliderExample trackImage={require('./slider.png')} />;
    },
  },
  {
    title: 'Custom min/max track image',
    platform: 'ios',
    render(): Element<any> {
      return (
        <SliderExample
          minimumTrackImage={require('./slider-left.png')}
          maximumTrackImage={require('./slider-right.png')}
        />
      );
    },
  },
  {
    title: 'Inverted slider direction',
    render(): React.Element<any> {
      return <SliderExample
        value={0.6}
        inverted
      />;
    },
  },
  {
    title: 'Custom slider',
    render(): React.Element<any> {
      return <SliderExample
        style={{ width: '100%', marginVertical: 20 }}
        minimumTrack={() => <View style={{ opacity: 0.6, transform: [{ rotate: '15deg' }], height: 5, backgroundColor: 'red' }} />}
        maximumTrack={() => <View style={{ flex: 1, opacity: 0.3, transform: [{ rotate: '-15deg' }], height: 5, backgroundColor: 'blue' }} />}
        backgroundTrack={() => <Animated.View style={{ height: 5, opacity: 0.1, backgroundColor: 'magenta' }} />}
      />;
    },
  },
  {
    title: 'Custom Thumb & Tracks + ANIMATIONS',
    platform: 'android',
    render(): React.Element<any> {
      const useNativeDriver = true;
      const springer = new Animated.Value(0);
      const timer = new Animated.Value(0);
      const rads = 6 * Math.PI;
      const rotate = Animated.multiply(springer, rads);

      const shrink = timer.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.5]
      });
      const scale = timer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 2]
      });
      const scale1 = timer.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2]
      });
      const gentleOpacity = springer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 0.9]
      });

      const animator = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.spring(springer, { toValue: 1, useNativeDriver }),
            Animated.spring(springer, { toValue: 0, useNativeDriver }),
          ]),
          Animated.sequence([
            Animated.timing(timer, { toValue: 1, useNativeDriver }),
            Animated.timing(timer, { toValue: 0, useNativeDriver }),
          ])
        ])
      );
      animator.start();

      const thumb = React.createRef();
      const timeout = React.createRef();


      return (
        <>
          <View style={[StyleSheet.absoluteFill, { opacity: 0 }]} pointerEvents="none">
            <Animated.View
              ref={thumb}
              style={{
                alignItems: 'center', justifyContent: 'center', width: 40, height: 40,
                transform: [{ rotateX: rotate, rotateY: rotate, rotateZ: rotate, scale: scale1 }]
              }}
              collapsable={false}
            >
              <Animated.View
                style={{ backgroundColor: 'blue', borderRadius: 50, alignItems: 'center', justifyContent: 'center', width: 30, height: 30, transform: [{ rotateX: rotate }] }}
                collapsable={false}
              >
                <Image
                  source={require('./uie_thumb_big.png')}
                  style={{ width: 25, height: 25 }}
                />
              </Animated.View>
            </Animated.View>
          </View>
          <SliderExample
            value={0.6}
            inverted
            thumbTintColor={'yellow'}
            minimumValue={-1}
            maximumValue={2}
            style={{ width: 300 }}
            ref={r => {
              clearTimeout(timeout.current);
              if (r) {
                timeout.current = setTimeout(() => r && r.setNativeProps({ minimumTrackViewTag: null }), 15000);
              }             
            }}
            minimumTrackTintColor={'magenta'}
            maximumTrackTintColor={'red'}
            thumb={thumb}
            maximumTrack={() => <Animated.View
              style={{ height: 5, opacity: Animated.subtract(1, timer), transform: [{ rotate: rotate }] }}
              collapsable={false}
            >
              <Animated.View style={{ backgroundColor: 'blue', flex: 1, borderRadius: 50 }} />
            </Animated.View>}
            minimumTrack={() => <Animated.View
              style={{ flex: 1, flexDirection: 'row', borderColor: 'purple', borderWidth: 3, transform: [{ rotateY: rotate }, { scaleY: scale1 }] }}
              collapsable={false}
            >
              <Animated.View style={{ backgroundColor: 'yellow', borderColor: 'gold', borderWidth: 5, flex: 1, transform: [{ rotateY: Animated.divide(rotate, 6) }] }} />
              <View style={{ backgroundColor: 'white', flex: 1 }}>
                <Animated.View style={{ backgroundColor: 'orange', flex: 1, transform: [{ scale }, { rotateY: '180deg' }], justifyContent: 'center', alignItems: 'center' }}>
                  <Animated.Text>AWESOME</Animated.Text>
                </Animated.View>
              </View>
              <Animated.View style={{ backgroundColor: 'red', flex: 1, transform: [{ rotateX: rotate }] }} />
              <Animated.View
                style={{ backgroundColor: 'magenta', flex: 1, transform: [{ scale: shrink }, { rotate }], opacity: springer }}
                ref={r => {
                  setTimeout(() => r && r.setNativeProps({ backgroundColor: 'pink' }), 5000)
                }}
              />
            </Animated.View>}
          />
        </>
      );
    },
  },
];