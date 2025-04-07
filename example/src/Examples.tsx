import React, {FC, useCallback, useState} from 'react';
import {Text, View, StyleSheet, Image} from 'react-native';
import Slider, {MarkerProps, SliderProps} from '@callstack/slider';

export interface Props {
  title: string;
  render(): JSX.Element;
  platform?: string;
}

const CONSTANTS = {
  MAX_VALUE: 100,
  MIN_VALUE: 10,
  STEP: 10,
  DEFAULT_STEP_RESOLUTION: 100,
} as const;

const SliderExample = (props: SliderProps) => {
  const [value, setValue] = useState(props.value ?? 0);
  return (
    <View style={{alignItems: 'center'}}>
      <Text style={styles.text}>{value && +value.toFixed(3)}</Text>
      <Slider
        step={0.5}
        style={[styles.slider, props.style]}
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
  const renderStepMarker = useCallback(({stepMarked}: MarkerProps) => {
    return stepMarked ? (
      <View style={styles.outerTrue}>
        <View style={styles.innerTrue} />
      </View>
    ) : (
      <View style={styles.outer}>
        <View style={styles.inner} />
      </View>
    );
  }, []);

  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={4}
        step={1}
        tapToSeek
        StepMarker={renderStepMarker}
        minimumTrackTintColor={'#112233'}
        maximumTrackTintColor={'#00FF00'}
      />
    </View>
  );
};

const SlidingStepsNumbersExample = (props: SliderProps) => {
  const renderStepMarker = useCallback(({stepMarked}: MarkerProps) => {
    return stepMarked ? (
      <View style={styles.outerTrue}>
        <View style={styles.innerTrue} />
      </View>
    ) : (
      <View style={styles.outer}>
        <View style={styles.inner} />
      </View>
    );
  }, []);

  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={5}
        step={1}
        tapToSeek
        renderStepNumber
        StepMarker={renderStepMarker}
        minimumTrackTintColor={'#123456'}
        maximumTrackTintColor={'#00FF00'}
      />
    </View>
  );
};

const SlidingStepsSmallNumbersExample = (props: SliderProps) => {
  const renderStepMarker = useCallback(({stepMarked}: MarkerProps) => {
    return stepMarked ? (
      <View style={styles.outerTrueSmall}>
        <View style={styles.innerTrueSmall} />
      </View>
    ) : (
      <View style={styles.outerSmall}>
        <View style={styles.innerSmall} />
      </View>
    );
  }, []);

  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={5}
        step={1}
        tapToSeek
        renderStepNumber
        StepMarker={renderStepMarker}
        minimumTrackTintColor={'#123456'}
        maximumTrackTintColor={'#00FF00'}
      />
    </View>
  );
};

const SlidingCustomStepsThumbImageNumbersExample = (props: SliderProps) => {
  const renderStepMarker = useCallback(({stepMarked}: MarkerProps) => {
    return stepMarked ? (
      <View style={styles.outerTrue}>
        <View style={styles.innerTrue} />
      </View>
    ) : (
      <View style={styles.outer}>
        <View style={styles.inner} />
      </View>
    );
  }, []);
  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={4}
        step={1}
        tapToSeek
        renderStepNumber
        thumbImage={require('./resources/ck-icon.png')}
        StepMarker={renderStepMarker}
        minimumTrackTintColor={'#123456'}
        maximumTrackTintColor={'#654321'}
      />
    </View>
  );
};

const SlidingCustomStepsAnotherThumbImageNumbersExample = (
  props: SliderProps,
) => {
  const renderStepMarker = useCallback(({stepMarked}: MarkerProps) => {
    return stepMarked ? (
      <View style={styles.outerTrueSmall}>
        <View style={styles.innerTrueSmall} />
      </View>
    ) : (
      <View style={styles.outerSmall}>
        <View style={styles.innerSmall} />
      </View>
    );
  }, []);

  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={15}
        step={1}
        tapToSeek
        renderStepNumber
        thumbImage={require('./resources/twitter-small.png')}
        StepMarker={renderStepMarker}
        minimumTrackTintColor={'#123456'}
        maximumTrackTintColor={'#654321'}
      />
    </View>
  );
};

const InvertedSliderWithStepMarker = (props: SliderProps) => {
  const renderStepMarker = useCallback(({stepMarked}: MarkerProps) => {
    return stepMarked ? (
      <View style={styles.outerTrueSmall}>
        <View style={styles.innerTrueSmall} />
      </View>
    ) : (
      <View style={styles.outerSmall}>
        <View style={styles.innerSmall} />
      </View>
    );
  }, []);

  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={15}
        step={1}
        tapToSeek
        renderStepNumber
        thumbImage={require('./resources/twitter-small.png')}
        StepMarker={renderStepMarker}
        inverted
        minimumTrackTintColor={'#123456'}
        maximumTrackTintColor={'#654321'}
      />
    </View>
  );
};

const SlidingCustomStepsThumbImageWithNumbersAndDifferentWidth = (
  props: SliderProps,
) => {
  const renderStepMarker = useCallback(({stepMarked}: MarkerProps) => {
    return stepMarked ? (
      <View style={[styles.innerTrue, {top: 3}]} />
    ) : (
      <View style={[styles.inner, {top: 3}]} />
    );
  }, []);

  return (
    <View>
      <SliderExample
        {...props}
        minimumValue={0}
        maximumValue={3}
        step={1}
        style={{width: 200}}
        tapToSeek
        renderStepNumber
        StepMarker={renderStepMarker}
        minimumTrackTintColor={'#ABCDEF'}
        maximumTrackTintColor={'#001122'}
      />
    </View>
  );
};

const MyStepMarker: FC<MarkerProps> = ({stepMarked, currentValue}) => {
  return stepMarked ? (
    <View style={styles.background}>
      <View style={styles.separator} />
      <View style={styles.label}>
        {currentValue !== undefined ? (
          <Text>
            {currentValue % 1 === 0 ? currentValue : currentValue.toFixed(2)}
          </Text>
        ) : (
          <Text>{'-'}</Text>
        )}
        <Image
          style={styles.tinyLogo}
          source={Image.resolveAssetSource(
            require('./resources/twitter-small.png'),
          )}
        />
      </View>
    </View>
  ) : (
    <View style={styles.divider} />
  );
};

const CustomComponent: FC<MarkerProps> = ({
  stepMarked,
  currentValue,
  index,
  max,
}) => {
  if (stepMarked) {
    return (
      <View style={styles.customComponentFrame}>
        <View style={[styles.customComponentLeftFrame, styles.filled]}>
          <Text style={styles.trackText}>{index}</Text>
        </View>
        <View style={[styles.customComponentRightFrame, styles.empty]}>
          <Text style={styles.trackText}>{max}</Text>
        </View>
        <Text style={[styles.trackText, {position: 'absolute', left: 18}]}>
          /
        </Text>
      </View>
    );
  }
  return currentValue > index ? (
    <View style={[styles.trackDot, styles.filled]} />
  ) : (
    <View style={[styles.trackDot, styles.empty]} />
  );
};

const SliderExampleWithCustomMarker = (props: SliderProps) => {
  const [value, setValue] = useState(props.value ?? CONSTANTS.MIN_VALUE);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{value && +value.toFixed(3)}</Text>
      <Slider
        step={CONSTANTS.STEP}
        style={[styles.slider, props.style]}
        minimumValue={CONSTANTS.MIN_VALUE}
        maximumValue={CONSTANTS.MAX_VALUE}
        thumbImage={require('./resources/empty.png')}
        tapToSeek
        {...props}
        value={value}
        onValueChange={setValue}
        lowerLimit={1}
        StepMarker={MyStepMarker}
        minimumTrackTintColor={'#00629A'}
        maximumTrackTintColor={'#979EA4'}
      />
    </View>
  );
};
const SliderExampleWithCustomComponentAndFilledSteps = (props: SliderProps) => {
  const [value, setValue] = useState(props.value || 50);

  return (
    <View style={{alignItems: 'center'}}>
      <Text style={styles.text}>{value && +value.toFixed(3)}</Text>
      <Slider
        step={CONSTANTS.STEP}
        style={[styles.slider, props.style]}
        minimumValue={CONSTANTS.MIN_VALUE}
        maximumValue={CONSTANTS.MAX_VALUE}
        StepMarker={CustomComponent}
        {...props}
        value={value}
        onValueChange={setValue}
        minimumTrackTintColor={'#00629A'}
        maximumTrackTintColor={'#979EA4'}
      />
    </View>
  );
};

export default SliderExample;

const styles = StyleSheet.create({
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
      return <SlidingStepsExample />;
    },
  },
  {
    title: 'Slider with customized indicator and default numbers',
    render() {
      return <SlidingStepsNumbersExample />;
    },
  },
  {
    title: 'Slider with smaller customized indicator and default numbers',
    render() {
      return <SlidingStepsSmallNumbersExample />;
    },
  },
  {
    title: 'Slider with custom steps, thumbImage and steps numbers',
    render() {
      return <SlidingCustomStepsThumbImageNumbersExample />;
    },
  },
  {
    title: 'Slider with custom steps, different thumbImage and steps numbers',
    render() {
      return <SlidingCustomStepsAnotherThumbImageNumbersExample />;
    },
  },
  {
    title: 'Slider with custom steps, different width and thumbImage',
    render() {
      return <SlidingCustomStepsThumbImageWithNumbersAndDifferentWidth />;
    },
  },
  {
    title: 'Inverted slider direction with steps number and thumbImage',
    render() {
      return <InvertedSliderWithStepMarker />;
    },
  },
  {
    title: 'Custom step marker settings',
    render() {
      return <SliderExampleWithCustomMarker />;
    },
  },
  {
    title: 'Custom component with steps filled when passed',
    render() {
      return <SliderExampleWithCustomComponentAndFilledSteps />;
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
];
