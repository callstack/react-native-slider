import React, {JSX, useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import Slider, {SliderProps, ThumbProps} from '@react-native-community/slider';

export interface Props {
  title: string;
  render(): JSX.Element;
  platform?: string;
}

const SliderExample = (props: SliderProps) => {
  const [value, setValue] = useState(props.value ?? 0);
  const [valueLeft, setValueLeft] = useState(props.valueLeft ?? 0);
  const [valueRight, setValueRight] = useState(props.valueRight ?? 0);

  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.text}>{`${valueLeft.toFixed(3)} - ${
        value && +value.toFixed(3)
      } - ${valueRight.toFixed(3)}`}</Text>
      <Slider
        step={0.5}
        style={[styles.slider, props.style]}
        {...props}
        value={value}
        valueLeft={valueLeft}
        valueRight={valueRight}
        onValueChange={newValue => {
          console.log(newValue);
          setValue(newValue);
        }}
        onLeftValueChange={newValue => {
          console.log('onLeftValueChange', newValue);
          setValueLeft(newValue);
        }}
        onRightValueChange={newValue => {
          console.log('onRightValueChange', newValue);
          setValueRight(newValue);
        }}
        onSlidingStart={() => {
          console.log('onSlidingStart');
        }}
        onSlidingComplete={() => {
          console.log('onSlidingComplete');
        }}
      />
    </View>
  );
};

export default SliderExample;

const styles = StyleSheet.create({
  sliderContainer: {
    alignItems: 'center',
  },
  customTrack: {
    height: 28,
    width: 100,
    borderWidth: 2,
    borderColor: 'purple',
    backgroundColor: 'transparent',
  },
  customThumb: {
    height: 35,
    width: 35,
    borderColor: 'purple',
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(240,250,250,0.9)',
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 0,
  },
  trackText: {
    color: '#FFFFFF',
    fontSize: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    top: 12,
  },
  trackDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    top: 4,
  },
  empty: {
    backgroundColor: '#B3BFC9',
  },
  filled: {
    backgroundColor: '#00629A',
  },
  customComponentFrame: {
    flex: 1,
    flexDirection: 'row',
    top: -10,
    opacity: 0.95,
  },
  customComponentLeftFrame: {
    height: 40,
    width: 20,
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
  },
  customComponentRightFrame: {
    height: 40,
    width: 20,
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
  },
  divider: {
    width: 2,
    height: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    width: 2,
    height: 20,
    backgroundColor: '#00629A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: 10,
    width: 55,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tinyLogo: {
    marginVertical: 2,
    aspectRatio: 1,
    flex: 1,
    height: '100%',
    width: '100%',
  },
  minMaxLabel: {
    flexDirection: 'row',
    zIndex: -1,
  },
  slider: {
    width: 300,
    opacity: 1,
    marginTop: 10,
  },
  outer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#11FF11',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerTrue: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0F0FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111111',
  },
  innerTrue: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F0FFF',
  },
  container: {
    alignItems: 'center',
  },
  outerSmall: {
    width: 4,
    height: 4,
    top: 6,
    borderRadius: 2,
    backgroundColor: '#003366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerTrueSmall: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#ABCDEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerSmall: {
    width: 7,
    height: 7,
    borderRadius: 1,
    backgroundColor: '#223366',
  },
  innerTrueSmall: {
    width: 7,
    height: 7,
    borderRadius: 1,
    backgroundColor: '#334488',
  },
});

export const examples: Props[] = [
  {
    title: 'Default settings ranged',
    render() {
      return (
        <SliderExample
          ranged
          valueLeft={20}
          valueRight={80}
          maximumValue={100}
          minimumValue={0}
          upperLimit={90}
          lowerLimit={10}
        />
      );
    },
  },
  {
    title: 'Default settings',
    render() {
      return (
        <SliderExample
          minimumTrackColor={'#FEDCBA'}
          middleRangeTrackColor={'#FEDCBA'}
          maximumTrackColor={'#ABCDEF'}
        />
      );
    },
  },
  {
    title: 'Slider with custom track',
    render() {
      return (
        <SliderExample
          minimumValue={0}
          maximumValue={50}
          step={1}
          track={() => <View style={styles.customTrack} />}
        />
      );
    },
  },
  {
    title: 'Default settings vertical',
    render() {
      return (
        <SliderExample
          ranged
          valueLeft={20}
          valueRight={80}
          maximumValue={100}
          minimumValue={0}
          upperLimit={90}
          lowerLimit={10}
          orientation="vertical"
        />
      );
    },
  },
  {
    title: 'Customized look',
    render() {
      return (
        <SliderExample
          minimumValue={0}
          valueRight={25}
          maximumValue={50}
          ranged
          step={1}
          thumb={({index}: ThumbProps) => (
            <View style={styles.customThumb}>
              <Text>{index}</Text>
            </View>
          )}
          minimumTrackColor={'#123456'}
          middleRangeTrackColor={'purple'}
          maximumTrackColor={'#ABCDEF'}
        />
      );
    },
  },
];
