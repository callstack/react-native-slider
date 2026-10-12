import type {
  CodegenTypes,
  ColorValue,
  HostComponent,
  ViewProps,
} from "react-native";
import {codegenNativeComponent} from "react-native";

type SliderValueChangeEvent = Readonly<{
  value: CodegenTypes.Double;
}>;

export interface NativeProps extends ViewProps {
  /**
   * Lower bound of the range the slider can select from.
   */
  minimumValue?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;

  /**
   * Upper bound of the range the slider can select from.
   */
  maximumValue?: CodegenTypes.WithDefault<CodegenTypes.Double, 1>;

  /**
   * Position of the thumb, expressed in the slider's own range.
   */
  value?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;

  /**
   * Whether the slider selects a span of its range with two thumbs, rather
   * than a single value with one.
   */
  ranged?: CodegenTypes.WithDefault<boolean, false>;

  /**
   * Position of the thumb bounding the selected span from below, expressed in
   * the slider's own range. Only used by a ranged slider.
   */
  valueLeft?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;

  /**
   * Position of the thumb bounding the selected span from above, expressed in
   * the slider's own range. Only used by a ranged slider.
   */
  valueRight?: CodegenTypes.WithDefault<CodegenTypes.Double, 1>;

  /**
   * Granularity the slider's values snap to: every value it reports is a
   * multiple of this. 0 means no granularity.
   */
  step?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;

  /**
   * Lowest position a thumb can be dragged to, expressed in the slider's own
   * range. The track is still drawn from `minimumValue`.
   */
  lowerLimit?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;

  /**
   * Highest position a thumb can be dragged to, expressed in the slider's own
   * range. The track is still drawn up to `maximumValue`.
   */
  upperLimit?: CodegenTypes.WithDefault<CodegenTypes.Double, 1>;

  /**
   * Axis the slider is laid out along. A vertical slider holds its lowest
   * value at the bottom and its highest at the top.
   */
  orientation?: CodegenTypes.WithDefault<
    "horizontal" | "vertical",
    "horizontal"
  >;

  /**
   * Tint of the track from `minimumValue` up to the thumb, or up to the lower
   * thumb of a ranged slider. Left unset, the platform's own tint is used.
   */
  minimumTrackColor?: ColorValue;

  /**
   * Tint of the track between the two thumbs of a ranged slider. Left unset,
   * the platform's own tint is used.
   */
  middleRangeTrackColor?: ColorValue;

  /**
   * Tint of the track from the thumb, or from the upper thumb of a ranged
   * slider, up to `maximumValue`. Left unset, the platform's own tint is used.
   */
  maximumTrackColor?: ColorValue;

  /**
   * Whether the first of the slider's children is a track JS renders in place
   * of the built-in one, rather than a custom thumb. A replaced track is not
   * drawn at all, so it outranks the three track colours.
   */
  customTrack?: CodegenTypes.WithDefault<boolean, false>;

  /**
   * Whether the slider's children include the thumbs JS renders in place of
   * the built-in ones: one for a single slider and two for a ranged one,
   * following the custom track when there is one.
   */
  customThumb?: CodegenTypes.WithDefault<boolean, false>;

  /**
   * How the steps are marked below the track: not at all, by markers the
   * slider draws itself, or by the views JS renders, one for each step, as the
   * last of the slider's children. Has no effect on a slider with no step.
   */
  stepMarkers?: CodegenTypes.WithDefault<"none" | "native" | "custom", "none">;

  /**
   * Emitted continuously while the user drags the thumb.
   */
  onValueChange?: CodegenTypes.DirectEventHandler<SliderValueChangeEvent>;

  /**
   * Emitted continuously while the user drags the lower thumb of a ranged
   * slider.
   */
  onLeftValueChange?: CodegenTypes.DirectEventHandler<SliderValueChangeEvent>;

  /**
   * Emitted continuously while the user drags the upper thumb of a ranged
   * slider.
   */
  onRightValueChange?: CodegenTypes.DirectEventHandler<SliderValueChangeEvent>;

  /**
   * Emitted once the user grabs a thumb, before it has moved anywhere. A
   * ranged slider reports whichever of its thumbs was grabbed first, and does
   * not report the second one being grabbed on top of it.
   */
  onSlidingStart?: CodegenTypes.DirectEventHandler<null>;

  /**
   * Emitted once the user lets go of the thumb they were dragging, whether or
   * not the drag moved it. A ranged slider reports the last of its thumbs
   * being let go of, so that every start is answered by exactly one complete.
   */
  onSlidingComplete?: CodegenTypes.DirectEventHandler<null>;
}

export default codegenNativeComponent<NativeProps>("RNCSlider", {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
