import React, {JSX, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Slider, {SliderProps, StepsProps, ThumbProps} from '@callstack/slider';

export interface Props {
  title: string;
  render(): JSX.Element;
}

/** Material 3's baseline primary, which is what Android tints its Slider with. */
const ACCENT = '#6750A4';

/**
 * The three tints of the track, stepped through Material 3's own baseline
 * purple - tones 40, 80 and 90, the darkest where the value has been reached
 * and the palest ahead of it. The middle is what a single Slider has none of.
 */
const TRACK_COLORS = {
  minimumTrackColor: ACCENT, // tone 40
  middleRangeTrackColor: '#D0BCFF', // tone 80
  maximumTrackColor: '#EADDFF', // tone 90
} as const;

/**
 * The bounds shared by every example but the default one, so that each of them
 * only has to say what it adds on top of them.
 */
const BOUNDS = {
  minimumValue: 0,
  maximumValue: 100,
  step: 5,
} as const;

/** One dash per step of `BOUNDS`, so that the dashes fall where the steps do. */
const DASHES = (BOUNDS.maximumValue - BOUNDS.minimumValue) / BOUNDS.step + 1;

const rounded = (value: number) => Math.round(value * 100) / 100;

/**
 * A thumb wearing the number of the step it stands on. `index` counts the steps
 * from `minimumValue`, so the thumb says how far along the range it is - and a
 * ranged Slider renders the very same component once for each of its thumbs.
 */
const SteppedThumb = ({index}: ThumbProps) => (
  <View style={styles.thumb}>
    <Text style={styles.thumbLabel}>{index}</Text>
  </View>
);

/**
 * A track of dashes in place of the solid rail. The Slider stretches whatever
 * `track` renders to its own length, so the dashes stretch with it.
 *
 * NOTE: `track` is given no props at all, so it cannot show how far the thumb
 * has travelled - the readout above each Slider is what reports the value.
 */
const DashedTrack = () => (
  <View style={styles.dashedTrack}>
    {Array.from({length: DASHES}, (_, index) => (
      <View
        key={index}
        style={[styles.dash, index % 2 === 1 && styles.mutedDash]}
      />
    ))}
  </View>
);

/**
 * A step drawn as a tick that fills in once a thumb stands on it. `value` is the
 * value the step stands for, so the ticks read as the scale the thumb travels
 * over - and every fourth of them says what it is worth.
 */
const SteppedMarker = ({value, marked}: StepsProps) => (
  <View style={styles.marker}>
    <View style={[styles.tick, marked && styles.markedTick]} />
    {value % 20 === 0 && (
      <Text style={[styles.markerLabel, marked && styles.markedLabel]}>
        {value}
      </Text>
    )}
  </View>
);

/**
 * Stands in front of a Slider of the given props, holding the state an app
 * around a Slider would: where each of its thumbs stands, and whether one of
 * them is being dragged. The Slider is not a controlled component, so this only
 * mirrors what its events report - a drag moves the thumb on its own.
 */
const SliderExample = (props: SliderProps) => {
  const {ranged, minimumValue = 0, maximumValue = 1} = props;

  const [value, setValue] = useState(props.value ?? minimumValue);
  const [left, setLeft] = useState(props.valueLeft ?? minimumValue);
  const [right, setRight] = useState(props.valueRight ?? maximumValue);
  const [dragging, setDragging] = useState(false);

  // A ranged Slider reports its thumbs one by one, and never through
  // `onValueChange`, which is what a single Slider is reported by.
  const readout = ranged
    ? `${rounded(left)} – ${rounded(right)}`
    : `${rounded(value)}`;

  return (
    <View style={styles.container}>
      <Text style={styles.readout}>
        {readout}
        {dragging ? '  ·  dragging' : ''}
      </Text>
      <Slider
        {...props}
        style={[styles.slider, props.style]}
        value={value}
        valueLeft={left}
        valueRight={right}
        onValueChange={setValue}
        onLeftValueChange={setLeft}
        onRightValueChange={setRight}
        onSlidingStart={() => setDragging(true)}
        onSlidingComplete={() => setDragging(false)}
      />
    </View>
  );
};

export const examples: Props[] = [
  {
    title: 'Default Slider',
    render() {
      // Only started off centre: with `minimumValue`, `maximumValue` and `step`
      // left out the thumb travels from 0 to 1 without snapping anywhere.
      return <SliderExample value={0.5} />;
    },
  },
  {
    title: 'minimumValue, maximumValue and step',
    render() {
      return <SliderExample {...BOUNDS} value={25} />;
    },
  },
  {
    title: 'The same, limited from top and bottom',
    render() {
      // The thumbs stop at the limits, while the track still spans the whole
      // range from `minimumValue` to `maximumValue`.
      return (
        <SliderExample {...BOUNDS} value={25} lowerLimit={20} upperLimit={80} />
      );
    },
  },
  {
    title: 'The same, ranged',
    render() {
      // Two thumbs bounding a span, snapping to the very same step.
      return (
        <SliderExample {...BOUNDS} ranged valueLeft={20} valueRight={60} />
      );
    },
  },
  {
    title: 'The three track colours',
    render() {
      // Ranged, because the track only splits into three parts between two
      // thumbs: up to the left one, the span they bound, and from the right
      // one to the maximum. A single Slider has no middle to colour.
      return (
        <SliderExample
          {...BOUNDS}
          {...TRACK_COLORS}
          ranged
          valueLeft={20}
          valueRight={60}
        />
      );
    },
  },
  {
    title: 'Custom thumb',
    render() {
      return <SliderExample {...BOUNDS} value={25} thumb={SteppedThumb} />;
    },
  },
  {
    title: 'Default step markers',
    render() {
      // The same Slider, with the markers the Slider draws for its own steps
      // switched on: a dot below each step, tinted once a thumb stands on it.
      return (
        <SliderExample
          {...BOUNDS}
          value={25}
          thumb={SteppedThumb}
          stepMarkers
        />
      );
    },
  },
  {
    title: 'Custom step markers',
    render() {
      // A marker hangs below the step it stands for, and says so through
      // `marked` - the Slider hands each one the value of its step, and whether
      // a thumb currently stands on it.
      return (
        <SliderExample
          {...BOUNDS}
          value={25}
          stepMarkers={SteppedMarker}
          style={styles.markedSlider}
        />
      );
    },
  },
  {
    title: 'Custom track',
    render() {
      return <SliderExample {...BOUNDS} value={25} track={DashedTrack} />;
    },
  },
  {
    title: 'Custom thumb and track',
    render() {
      return (
        <SliderExample
          {...BOUNDS}
          value={25}
          thumb={SteppedThumb}
          track={DashedTrack}
        />
      );
    },
  },
  {
    title: 'Custom thumb and track, ranged',
    render() {
      // The thumb is rendered twice, once holding the index of each thumb.
      return (
        <SliderExample
          {...BOUNDS}
          ranged
          valueLeft={20}
          valueRight={60}
          thumb={SteppedThumb}
          track={DashedTrack}
        />
      );
    },
  },
  {
    title: 'Limited from top and bottom, disabled',
    render() {
      // Switched off, the Slider keeps showing wherever the props put the
      // thumb, but takes no touches and reports no events of its own.
      return (
        <SliderExample
          {...BOUNDS}
          value={25}
          lowerLimit={20}
          upperLimit={80}
          disabled
        />
      );
    },
  },
  {
    title: 'Custom thumb and track, disabled',
    render() {
      // A thumb or a track JS renders is a view of its own, outside the one
      // the Slider draws, so it cannot be told to look switched off - instead
      // the Slider dims the room it hangs the view in, and everything goes
      // faint together.
      return (
        <SliderExample
          {...BOUNDS}
          value={25}
          thumb={SteppedThumb}
          track={DashedTrack}
          disabled
        />
      );
    },
  },
];

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  slider: {
    width: '90%',
    marginTop: 10,
  },
  readout: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333333',
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: ACCENT,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // The lift, taken the way each platform asks for it.
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 1},
  },
  thumbLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: ACCENT,
  },
  dashedTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ECE6F5',
    flexDirection: 'row',
  },
  dash: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  mutedDash: {
    opacity: 0.35,
  },
  // A Slider grows itself to fit the markers it draws, but not the ones JS
  // renders, so the room those hang into has to be given from here - a marker
  // hangs from a point below the thumb, and nothing clips it.
  markedSlider: {
    height: 112,
  },
  marker: {
    alignItems: 'center',
  },
  // The tick only changes its width and its colour when marked: a marker is hung
  // from the point below its step, so one that grew any taller would push the
  // label under it down every time a thumb came to rest on it.
  tick: {
    width: 2,
    height: 12,
    borderRadius: 1,
    backgroundColor: '#CAC4D0', // M3 outline variant
  },
  markedTick: {
    width: 4,
    borderRadius: 2,
    backgroundColor: ACCENT,
  },
  markerLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '500',
    color: '#79747E', // M3 outline
  },
  markedLabel: {
    color: ACCENT,
    fontWeight: '600',
  },
});

export default SliderExample;
