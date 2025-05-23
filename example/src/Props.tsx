import React, {JSX, useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import Slider, {SliderProps} from '@react-native-community/slider';

export interface Props {
  title: string;
  render(): JSX.Element;
}

const SliderExample = (props: SliderProps) => {
  const [value, setValue] = useState(0);
  return (
    <View>
      <Text style={styles.text}>{value && +value.toFixed(3)}</Text>
      <Slider style={styles.slider} {...props} onValueChange={setValue} />
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
        onSlidingStart={value => {
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

const SlidingCompleteExample = () => {
  const [slideCompletionValue, setSlideCompletionValue] = useState(0);
  const [slideCompletionCount, setSlideCompletionCount] = useState(0);
  return (
    <View>
      <SliderExample
        onSlidingComplete={value => {
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

export const propsExamples: Props[] = [
  {
    title: 'Default settings',
    render() {
      return <SliderExample />;
    },
  },
  {
    title: 'disabled',
    render() {
      return <SliderExample disabled />;
    },
  },
  {
    title: 'maximumValue',
    render() {
      return <SliderExample maximumValue={10} />;
    },
  },
  {
    title: 'minimumTrackTintColor',
    render() {
      return <SliderExample minimumTrackTintColor="#123456" />;
    },
  },
  {
    title: 'minimumValue',
    render() {
      return <SliderExample minimumValue={5} />;
    },
  },
  {
    title: 'onSlidingStart',
    render() {
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
    title: 'onValueChange',
    render() {
      return <SliderExample />;
    },
  },
  {
    title: 'step',
    render() {
      return <SliderExample step={0.1} />;
    },
  },
  {
    title: 'maximumTrackTintColor',
    render() {
      return <SliderExample maximumTrackTintColor="#123456" />;
    },
  },
  {
    title: 'value',
    render() {
      return <SliderExample value={0.5} />;
    },
  },
  {
    title: 'tapToSeek',
    render(): React.ReactElement {
      return <SliderExample tapToSeek={true} />;
    },
  },
  {
    title: 'inverted',
    render() {
      return <SliderExample inverted />;
    },
  },
  {
    title: 'vertical',
    render() {
      return <SliderExample vertical />;
    },
  },
  {
    title: 'thumbTintColor',
    render() {
      return <SliderExample thumbTintColor={'magenta'} />;
    },
  },
  {
    title: 'maximumTrackImage',
    render() {
      return (
        <SliderExample
          maximumTrackImage={require('./resources/slider-right.png')}
        />
      );
    },
  },
  {
    title: 'minimumTrackImage',
    render() {
      return (
        <SliderExample
          minimumTrackImage={require('./resources/slider-left.png')}
        />
      );
    },
  },
  {
    title: 'thumbImage',
    render() {
      return (
        <SliderExample thumbImage={require('./resources/uie_thumb_big.png')} />
      );
    },
  },
  {
    title: 'trackImage',
    render() {
      return <SliderExample trackImage={require('./resources/slider.png')} />;
    },
  },
];
