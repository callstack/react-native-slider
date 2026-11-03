# Example app

A small React Native application that exercises `@callstack/slider` on both platforms it supports.
It renders one Slider per feature, each under its own title, in a single scrolling list — so it
doubles as the manual check you run before opening a pull request.

The sources live in [src/](src/):

| File | Role |
| ---- | ---- |
| [src/App.tsx](src/App.tsx) | Draws the list: a title, a `ScrollView`, and one block per example. |
| [src/Examples.tsx](src/Examples.tsx) | The examples themselves, plus the custom thumb, track and step marker they share. |

## Running the app

### From the repository root

```sh
npm install              # installs the dependencies of package/ and of example/
npm run example-ios      # pod-install + run-ios
npm run example-android  # run-android
```

### From this directory

```sh
npm install
npm start                # Metro
npm run ios              # in another terminal
npm run android
```

The example consumes the library through `"@callstack/slider": "file:../package"`, and its
`postinstall` script **copies** `package/` into `example/node_modules/@callstack/slider`. Because of
that copy, changes you make in `package/` are not picked up by Metro on their own — refresh the
copy after editing the library:

```sh
npm run refresh-package
```

Other scripts available here:

| Script | What it does |
| ------ | ------------ |
| `npm run refresh-package` | Re-copies `package/` into the example's `node_modules`. Run it after any change to the library sources. |
| `npm run lint` | ESLint over the example sources. |
| `npx tsc --noEmit` | Type-checks the example sources. Both of the above run in CI. |
| `npm test` | Jest, using `jest.config.js`. |
| `npm run clean-android` | Removes `android/app/build`. |
| `npm run clean-ios` | Removes `ios/build/generated/ios`, `ios/Pods` and `ios/Podfile.lock`. |

Requirements are the usual React Native ones for [0.87](https://reactnative.dev/docs/set-up-your-environment):
Node `^22.13.0 || ^24.3.0 || >= 26.0.0`, Xcode and CocoaPods for iOS, Android SDK and JDK for Android.

There is a `npm run windows` script and a `windows/` project too, but iOS and Android are the
platforms Slider supports today, and those are the only two the CI builds the example for.

## How the examples are written

Almost every example is a `SliderExample`, which stands in front of a Slider and holds the state an
app around a Slider would: where each thumb stands, and whether one of them is being dragged. The
readout above each Slider is that state, printed.

```tsx
const rounded = (value: number) => Math.round(value * 100) / 100;

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
```

The Slider is **not a controlled component**, so this only mirrors what its events report — a drag
moves the thumb on its own, without `SliderExample` writing the value back.

The snippets under each example below hold a plain `Slider` with every prop spelled out, so that you
can copy one into your own code as it stands. Each carries `style={{width: '90%'}}`, since a Slider
sizes itself to its container and needs some width to be given — and one of them a height too, for the
reason given there. None of them passes a handler — the
Slider is not controlled, so a drag moves the thumb whether or not you are listening; add
`onValueChange` (or `onLeftValueChange` / `onRightValueChange` when `ranged`) to hear about it.

Every snippet assumes this import:

```tsx
import Slider, {StepsProps, ThumbProps} from '@callstack/slider';
import {StyleSheet, Text, View} from 'react-native';
```

Most of the examples build on three pieces, given here in full — styles included — so that those
examples can be pasted as a whole: `SteppedThumb` is a thumb wearing the number of the step it
stands on, `DashedTrack` is a track of dashes in place of the solid rail, and `SteppedMarker` is a
step drawn as a tick that fills in once a thumb stands on it. `DASHES` is how many dashes to draw:
one per step position of a `0`–`100` range taken by `5`.

```tsx
/** Material 3's baseline primary, which is what Android tints its Slider with. */
const ACCENT = '#6750A4';

/** One dash per step position of a 0-100 range taken by 5. */
const DASHES = 21;

const SteppedThumb = ({index}: ThumbProps) => (
  <View style={styles.thumb}>
    <Text style={styles.thumbLabel}>{index}</Text>
  </View>
);

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

const styles = StyleSheet.create({
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
  // A Slider grows itself to fit the markers it draws, but not the ones JS
  // renders, so the room those hang into has to be given from here - a marker
  // hangs from a point below the thumb, and nothing clips it.
  markedSlider: {
    height: 112,
  },
});
```

The app itself keeps this support code in [src/Examples.tsx](src/Examples.tsx) and additionally folds
what the examples share into two constants — the bounds every example but the first runs on, and the
three track tints — which is what lets each of its entries stay to a few lines. So the app's
sources read differently from the snippets here, while rendering the same Sliders:

```tsx
const BOUNDS = {
  minimumValue: 0,
  maximumValue: 100,
  step: 5,
} as const;

/** One dash per step of `BOUNDS`, so that the dashes fall where the steps do. */
const DASHES = (BOUNDS.maximumValue - BOUNDS.minimumValue) / BOUNDS.step + 1;

/** The three tints, stepped through Material 3's own baseline purple. */
const TRACK_COLORS = {
  minimumTrackColor: ACCENT, // tone 40
  middleRangeTrackColor: '#D0BCFF', // tone 80
  maximumTrackColor: '#EADDFF', // tone 90
} as const;
```

---

## Examples

In the order the app renders them.

### Default Slider

The smallest Slider there is: `minimumValue`, `maximumValue` and `step` are all left out, so the
defaults take over — a range of `0` to `1` — and the thumb travels across it without snapping
anywhere. Started at `0.5`, it sits in the middle of the track.

```tsx
<Slider value={0.5} style={{width: '90%'}} />;
```

### minimumValue, maximumValue and step

The three props that define what the Slider selects. The range runs `0` to `100`, and `step: 5` makes
the thumb land on multiples of the step instead of anywhere in between — whatever you receive from
`onValueChange` is only ever `0`, `5`, `10`, and so on.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  value={25}
  style={{width: '90%'}}
/>;
```

### The same, limited from top and bottom

`lowerLimit` and `upperLimit` cut off the ends of the range: the thumb stops at `20` from below and
at `80` from above, while the track is still drawn across the whole `0`–`100` span. That leftover
track at both ends is the point — a limit is not a new minimum or maximum.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  value={25}
  lowerLimit={20}
  upperLimit={80}
  style={{width: '90%'}}
/>;
```

### The same, ranged

`ranged` turns the single thumb into two bounding a span, positioned by `valueLeft` and `valueRight`
rather than `value`. Both thumbs snap to the very same `step`, and neither can be dragged past the
other. Each of them reports through `onLeftValueChange` / `onRightValueChange`, and a ranged Slider
sends no `onValueChange` at all.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  ranged
  valueLeft={20}
  valueRight={60}
  style={{width: '90%'}}
/>;
```

### The three track colours

The track of a Slider is drawn in three parts, each with its own tint. A single Slider has only two
of them — up to the thumb, and from it to the maximum — so this example is ranged to show all three:
`minimumTrackColor` up to the left thumb, `middleRangeTrackColor` across the span the two bound, and
`maximumTrackColor` from the right thumb to `maximumValue`.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  ranged
  valueLeft={20}
  valueRight={60}
  minimumTrackColor="#6750A4"
  middleRangeTrackColor="#D0BCFF"
  maximumTrackColor="#EADDFF"
  style={{width: '90%'}}
/>;
```

The tints are the ones the example app reuses everywhere else: Material 3's baseline purple at tones
40, 80 and 90, darkest where the value has been reached and palest ahead of it. Leave any of them out
and the platform fills that part in with its own — Android keeps Material 3's colours, iOS tints the
selected part with its accent and draws the rest in system fill. The tints reach the built-in step markers too: a marked step takes the middle
tint (the thumb tint on a single Slider) and an unmarked one the maximum tint.

### Custom thumb

`thumb` replaces the built-in thumb with a component of yours. `SteppedThumb` — the one given above —
receives `index`, the number of the step the thumb stands on counted from `minimumValue`, and prints
it, so the thumb itself says how far along the range it is. Standing on `25` of a `step: 5` range
starting at `0`, it reads `5`.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  value={25}
  thumb={SteppedThumb}
  style={{width: '90%'}}
/>;
```

### Default step markers

`stepMarkers: true` draws a dot below every step the Slider has. A dot takes the tint of the selected
part of the track once a thumb stands on that step, and of the rest of it otherwise — so the row of
dots reads as how far the value has travelled, without the track being touched at all.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  value={25}
  thumb={SteppedThumb}
  stepMarkers
  style={{width: '90%'}}
/>;
```

The dots hang below the thumb, so a Slider drawing its own markers measures itself taller than one
without them and needs no style of its own to hold them. The prop is effective only when `step` is
set — with no step there are no steps to mark.

### Custom step markers

Given a component instead of `true`, `stepMarkers` renders each step with it. The Slider hands each
marker its `value` and whether a thumb currently stands on it as `marked`, and hangs it from the
point below its step — which is what lets `SteppedMarker` draw a scale: a tick that thickens and takes
the accent once a thumb rests on it, labelled every `20`.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  value={25}
  stepMarkers={SteppedMarker}
  style={{width: '90%', height: 112}}
/>;
```

Unlike the built-in dots, markers JS renders do not make the Slider any taller: they hang out of it
into whatever room the layout gives, unscaled and unclipped, so the labels come out readable. Nothing
gives them that room for you, though, so this is the one example that has to give its Slider a height
as well as a width — the `height` above is the `markedSlider` style the app's own entry for this
example passes. Too little of it and the labels are cut off at the bottom edge of the Slider.

### Custom track

`track` replaces the native rail. The Slider stretches whatever the component renders along its own
length, so the dashes of `DashedTrack` spread to fill the track, and `DASHES` gives them exactly one
dash per step position — which is why every second one is muted, and they still read as separate dashes
rather than one solid bar.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  value={25}
  track={DashedTrack}
  style={{width: '90%'}}
/>;
```

A custom track takes priority over `minimumTrackColor`, `middleRangeTrackColor` and
`maximumTrackColor`: the native track it replaces is left undrawn, tints and all. It is given no value
of its own, so it cannot show how far the thumb has travelled — a track you render is a decoration,
not a readout. In the app, the readout above each Slider is what reports the value. The step markers
are a separate layer, so `stepMarkers` still draws its dots under a custom track.

### Custom thumb and track

Both customizations at once, which is where the two layers have to cooperate: the JS-rendered thumb
rides on top of the JS-rendered track, and both are laid out by the Slider against the same value.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  value={25}
  thumb={SteppedThumb}
  track={DashedTrack}
  style={{width: '90%'}}
/>;
```

### Custom thumb and track, ranged

The same pair with two thumbs. A ranged Slider renders the `thumb` component twice, once for each
thumb, and each copy is given the index of the thumb it stands for — so the two labels read `4` and
`12` here, for the thumbs sitting on `20` and `60`.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  ranged
  valueLeft={20}
  valueRight={60}
  thumb={SteppedThumb}
  track={DashedTrack}
  style={{width: '90%'}}
/>;
```

### Limited from top and bottom, disabled

`disabled` switches the Slider off. It keeps showing wherever the props put the thumb and keeps
drawing it the way the platform draws its own disabled state, but it takes no touches and reports no
`onSlidingStart`, `onValueChange` or `onSlidingComplete` of its own. The limits are still there, just
unreachable.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  value={25}
  lowerLimit={20}
  upperLimit={80}
  disabled
  style={{width: '90%'}}
/>;
```

A Slider whose props change while it is switched off still moves its thumbs to where the new props
put them — it is the touching that is switched off, not the drawing.

### Custom thumb and track, disabled

A thumb or a track that JS renders is a view of its own, mounted over the one the Slider draws, so the
platform's own disabled look does not reach it. Rather than leave those pieces at full brightness over
a faded Slider, the Slider dims the containers it hangs them in to the faintness of a control nobody
can reach — so the whole of a switched-off Slider goes faint together, whatever JS drew into it.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  value={25}
  thumb={SteppedThumb}
  track={DashedTrack}
  disabled
  style={{width: '90%'}}
/>;
```

Each custom component is also passed `disabled` itself, which is how it can draw the state its own way
instead of only being dimmed. The two apply on top of each other, so a component that dims itself as
well ends up dimmed twice over — dim it yourself only instead of the dimming, not on top of it.

### Vertical orientation

`orientation: "vertical"` lays the very same Slider out along the other axis. It grows **upwards**:
`minimumValue` is at the bottom of the track and `maximumValue` at the top. The step, the limits, the
values and the events are all unchanged — only the axis the thumb travels along has moved.

`stepMarkers` is on, and the built-in dots come along for the turn — one per step, to the **right** of
the track, at the step each one stands for, tinted once the thumb rests on it.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  value={25}
  orientation="vertical"
  stepMarkers
  style={{width: 60, height: 220}}
/>;
```

The `style` is the one thing that has to be written differently than for a horizontal Slider. A Slider
takes its **length** from whichever axis the orientation runs along and its breadth from the other,
so a vertical one needs its height to be the generous side of the pair and its width the tight one —
the reverse of the `width: '90%'` every other snippet here carries. What a vertical Slider is given is
also what it is drawn inside of: the track and thumbs stay centred in the box, so a Slider given a wide
one shows its track down the middle of a wide gap rather than against an edge.

That swap is also what the markers pay for. The length is what they are spread along, but each one is
hung **across** the Slider — half a thumb and a gap past the middle of the track — so on a vertical
Slider they are spending the axis that a horizontal one spends its height on, and that axis is now the
narrow one. The `60` above is how much of it they need: the width a marked Slider measures itself to
when given none, Android's wider thumb setting the distance (a thumb of 44 with a 4 marker and its 4 gap
on either side of it). Give a Slider a width of its own and it is never asked to measure itself, so the
room is not grown into — it has to be handed over, in either orientation.

### Custom thumb and track, vertical

The same pair on the vertical Slider, this time with `SteppedMarker` marking the steps, and the point
of the example is what does *not* change: these are the very same `SteppedThumb`, `DashedTrack` and
`SteppedMarker` the horizontal examples pass, with no orientation-aware code in any of them.

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  step={5}
  value={25}
  thumb={SteppedThumb}
  track={DashedTrack}
  stepMarkers={SteppedMarker}
  orientation="vertical"
  style={{width: 96, height: 220}}
/>;
```

A custom track is written as a row of dashes and stretched along the Slider's **length**, and the
Slider then turns the whole thing a quarter turn with itself — which is what carries the first of the
dashes down to the bottom, where the minimum is. A custom thumb is never turned at all: it is centred
on the thumb it stands for, and that thumb only ever moves along the Slider.
