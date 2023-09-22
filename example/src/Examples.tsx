import React, {useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import Slider, {SliderProps} from '@react-native-community/slider';

export interface Props {
  title: string;
  render(): JSX.Element;
  platform?: string;
}

const SliderExample = (props: SliderProps) => {
  const [value, setValue] = useState(props.value ?? 0);
  return (
    <View style={{alignItems: "center"}}>
      <Text style={styles.text}>{value && +value.toFixed(3)}</Text>
      <Slider
        step={0.5}
        style={styles.slider}
        {...props}
        value={value}
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

const SlidingStepsExample = (props: SliderProps) => {
  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={5}
        step={1}
        tapToSeek
        stepMarker={(isMarked) => {
          return isMarked ? (
            <View style={styles.outerTrue}>
              <View style={styles.innerTrue} />
            </View>
          ) : (
            <View style={styles.outer}>
              <View style={styles.inner} />
            </View>
          );
        }}
        minimumTrackTintColor={"#112233"}
        maximumTrackTintColor={"#00FF00"}
      />
    </View>
  );
};

const SlidingStepsNumbersExample = (props: SliderProps) => {
  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={15}
        step={1}
        tapToSeek
        renderStepNumber
        stepMarker={(isMarked) => {
          return isMarked ? (
            <View style={styles.outerTrue}>
              <View style={styles.innerTrue} />
            </View>
          ) : (
            <View style={styles.outer}>
              <View style={styles.inner} />
            </View>
          );
        }}
        minimumTrackTintColor={"#123456"}
        maximumTrackTintColor={"#00FF00"}
      />
    </View>
  );
};

const SlidingStepsThumbImageExample = (props: SliderProps) => {
  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={15}
        step={1}
        tapToSeek
        thumbImage={require('./resources/ck-icon.png')}
        stepMarker
        minimumTrackTintColor={"#123456"}
        maximumTrackTintColor={"#00FF00"}
      />
    </View>
  );
};

const SlidingCustomStepsThumbImageExample = (props: SliderProps) => {
  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={15}
        step={1}
        tapToSeek
        thumbImage={require('./resources/ck-icon.png')}
        stepMarker={(isMarked) => {
          return isMarked ? (
            <View style={styles.outerTrue}>
              <View style={styles.innerTrue} />
            </View>
          ) : (
            <View style={styles.outer}>
              <View style={styles.inner} />
            </View>
          );
        }}
        minimumTrackTintColor={"#123456"}
        maximumTrackTintColor={"#FF0F00"}
      />
    </View>
  );
};

const SlidingCustomStepsThumbImageNumbersExample = (props: SliderProps) => {
  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={15}
        step={1}
        tapToSeek
        renderStepNumber
        thumbImage={require('./resources/ck-icon.png')}
        stepMarker={(isMarked) => {
          return isMarked ? (
            <View style={styles.outerTrue}>
              <View style={styles.innerTrue} />
            </View>
          ) : (
            <View style={styles.outer}>
              <View style={styles.inner} />
            </View>
          );
        }}
        minimumTrackTintColor={"#123456"}
        maximumTrackTintColor={"#654321"}
      />
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
  outer: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#11FF11",
    justifyContent: "center",
    alignItems: "center",
  },
  outerTrue: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#0F0FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: "#111111",
  },
  innerTrue: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: "#0F0FFF",
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
    title: 'step: 0.25, tap to seek on iOS',
    render(): React.ReactElement {
      return <SliderExample step={0.25} tapToSeek={true} />;
    },
  },
  {
    title: 'Limit on positive values [30, 80]',
    render() {
      return (
        <SliderExample
          step={1}
          value={40}
          minimumValue={0}
          maximumValue={120}
          lowerLimit={30}
          upperLimit={80}
        />
      );
    },
  },
  {
    title: 'Limit on negative values [-70, -20]',
    render() {
      return (
        <SliderExample
          step={1}
          value={-30}
          minimumValue={-80}
          maximumValue={0}
          lowerLimit={-70}
          upperLimit={-20}
        />
      );
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
    title: 'Slider with customized indicator and no numbers',
    render() {
      return (
        <SlidingStepsExample />
      )
    }
  },
  {
    title: 'Slider with customized indicator and default numbers',
    render() {
      return (
        <SlidingStepsNumbersExample />
      )
    }
  },
  {
    title: 'Slider with default indicator and thumbImage',
    render() {
      return (
        <SlidingStepsThumbImageExample />
      )
    }
  },
  {
    title: 'Slider with customized steps and thumbImage',
    render() {
      return (
        <SlidingCustomStepsThumbImageExample />
      )
    }
  },
  {
    title: 'Slider with custom steps, thumbImage and steps numbers',
    render() {
      return (
        <SlidingCustomStepsThumbImageNumbersExample />
      )
    }
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
];
