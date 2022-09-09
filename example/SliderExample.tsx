import React, {useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import Slider, {SliderProps} from '@react-native-community/slider';

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
        onSlidingComplete={value => {
          setSlideStartingValue(value);
          setSlideStartingCount(prev => prev + 1);
        }}
      />
      <Text>
        Completions: {slideStartingCount} Value: {slideStartingValue}
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

export const examples = [
  {
    title: 'Default settings',
    render(): React.ReactElement {
      return <SliderExample />;
    },
  },
  {
    title: 'Initial value: 0.5',
    render(): React.ReactElement {
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
    render(): React.ReactElement {
      return <SlidingCompleteExample />;
    },
  },
  {
    title: 'Custom min/max track tint color',
    render(): React.ReactElement {
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
    render(): React.ReactElement {
      return <SliderExample thumbTintColor={'magenta'} />;
    },
  },
  {
    title: 'Custom thumb image',
    render(): React.ReactElement {
      return <SliderExample thumbImage={require('./uie_thumb_big.png')} />;
    },
  },
  {
    title: 'Custom thumb (network image)',
    platform: 'windows',
    render(): React.ReactElement {
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
    render(): React.ReactElement {
      return <SliderExample trackImage={require('./slider.png')} />;
    },
  },
  {
    title: 'Custom min/max track image',
    platform: 'ios',
    render(): React.ReactElement {
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
    render(): React.ReactElement {
      return <SliderExample value={0.6} inverted />;
    },
  },
  {
    title: 'Disabled slider',
    platform: 'android',
    render(): React.ReactElement {
      return <SliderExample disabled value={0.6} />;
    },
  },
  {
    title: 'Slider with accessibilityState disabled',
    platform: 'android',
    render(): React.ReactElement {
      return <SliderExample disabled value={0.6} />;
    },
  },
];
