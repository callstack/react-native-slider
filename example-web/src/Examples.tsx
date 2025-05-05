import React, {useState} from 'react';
// @ts-ignore
import {Text, View, StyleSheet, ScrollView} from 'react-native';
// @ts-ignore
import Slider, {SliderProps} from '@react-native-community/slider';

export interface Props {
  title: string;
  render(): React.ReactElement;
  platform?: string;
}

const SliderExample = (props: SliderProps) => {
  const [value, setValue] = useState(0);
  return (
    <View>
      <Text style={styles.text}>{value && +value.toFixed(3)}</Text>
      <Slider
        step={0.5}
        style={styles.slider}
        {...props}
        onValueChange={setValue}
      />
    </View>
  );
};

const SlidingStartExample = (props: SliderProps) => {
  const [slideStartingValue, setSlideStartingValue] = useState(0);
  const [slideStartingCount, setSlideStartingCount] = useState(0);
  return (
    <View>
      <SliderExample
        {...props}
        onSlidingStart={(value: number) => {
          setSlideStartingValue(value);
          setSlideStartingCount(prev => prev + 1);
        }}
      />
      <Text>
        Starts: {slideStartingCount} Value: {slideStartingValue}
      </Text>
    </View>
  );
};

const SlidingCompleteExample = (props: SliderProps) => {
  const [slideCompletionValue, setSlideCompletionValue] = useState(0);
  const [slideCompletionCount, setSlideCompletionCount] = useState(0);
  return (
    <View>
      <SliderExample
        {...props}
        onSlidingComplete={(value: number) => {
          setSlideCompletionValue(value);
          setSlideCompletionCount(prev => prev + 1);
        }}
      />
      <Text>
        Completions: {slideCompletionCount} Value: {slideCompletionValue}
      </Text>
    </View>
  );
};

export default SliderExample;

const styles = StyleSheet.create({
  slider: {
    width: 300,
    opacity: 1,
    height: 50,
    marginTop: 10,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 0,
  },
});

export const examples: Props[] = [
  {
    title: 'Default settings',
    render() {
      return <SliderExample />;
    },
  },
  {
    title: 'Initial value: 0.5',
    render() {
      return <SliderExample value={0.5} />;
    },
  },
  {
    title: 'minimumValue: -1, maximumValue: 2',
    render(): React.ReactElement {
      return <SliderExample minimumValue={-1} maximumValue={2} />;
    },
  },
  {
    title: 'lowerLimit: 2, upperLimit: 7',
    render(): React.ReactElement {
      return <SliderExample minimumValue={0} maximumValue={10}  lowerLimit={2} upperLimit={7} />;
    },
  },
  {
    title: 'step: 0.25, tap to seek on iOS',
    render(): React.ReactElement {
      return <SliderExample step={0.25} tapToSeek={true} />;
    },
  },
  {
    title: 'onSlidingStart',
    render(): React.ReactElement {
      return <SlidingStartExample />;
    },
  },
  {
    title: 'onSlidingComplete',
    render() {
      return <SlidingCompleteExample />;
    },
  },
  {
    title: 'Custom min/max track tint color',
    render() {
      return (
        <SliderExample
          minimumTrackTintColor={'#00FF00'}
          maximumTrackTintColor={'red'}
          value={0.5}
        />
      );
    },
  },
  {
    title: 'Custom thumb tint color',
    render() {
      return <SliderExample thumbTintColor={'magenta'} />;
    },
  },
  {
    title: 'Custom thumb image',
    render() {
      return (
        <SliderExample thumbImage={require('./resources/uie_thumb_big.png')} />
      );
    },
  },
  {
    title: 'Custom thumb (network image)',
    platform: 'windows',
    render() {
      return (
        <SliderExample
          thumbImage={{
            uri: 'https://img.icons8.com/windows/50/000000/bus.png',
          }}
        />
      );
    },
  },
  {
    title: 'Custom track image',
    platform: 'ios',
    render() {
      return <SliderExample trackImage={require('./resources/slider.png')} />;
    },
  },
  {
    title: 'Custom min/max track image',
    platform: 'ios',
    render() {
      return (
        <SliderExample
          minimumTrackImage={require('./resources/slider-left.png')}
          maximumTrackImage={require('./resources/slider-right.png')}
        />
      );
    },
  },
  {
    title: 'Inverted slider direction',
    render() {
      return <SliderExample value={0.6} inverted />;
    },
  },
  {
    title: 'Vertical slider',
    platform: 'windows',
    render() {
      return <SliderExample value={0.6} vertical />;
    },
  },
  {
    title: 'Disabled slider',
    render() {
      return <SliderExample disabled value={0.6} />;
    },
  },
  {
    title: 'Slider with accessibilityState disabled',
    platform: 'android',
    render() {
      return <SliderExample disabled value={0.6} />;
    },
  },
  {
    title: 'Slider in horizontal scroll view',
    render() {
      return (
        <ScrollView
          horizontal
          style={{
            paddingVertical: 50,
            borderStyle: 'dotted',
            borderWidth: 1,
            flexDirection: 'row',
            width: 300,
          }}
          contentContainerStyle={{ overflowX: 'scroll' }}
        >
          <View style={{ width: 400, paddingLeft: 100 }}>
            <SliderExample maximumValue={100} />
            <Text style={{ textAlign: 'right', width: 200 }}>
              Scroll right, then slide ➔
            </Text>
          </View>
        </ScrollView>
      );
    },
  },
];
