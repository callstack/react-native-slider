import type {HostComponent, ViewProps} from 'react-native';
import {codegenNativeComponent} from 'react-native';
import type {
  Double,
  DirectEventHandler,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

type SliderValueChangeEvent = Readonly<{
  value: Double;
}>;

export interface NativeProps extends ViewProps {
  /**
   * Lower bound of the range the slider can select from.
   */
  minimumValue?: WithDefault<Double, 0>;

  /**
   * Upper bound of the range the slider can select from.
   */
  maximumValue?: WithDefault<Double, 1>;

  /**
   * Position of the thumb, expressed in the slider's own range.
   */
  value?: WithDefault<Double, 0>;

  /**
   * Whether the slider selects a span of its range with two thumbs, rather
   * than a single value with one.
   */
  ranged?: WithDefault<boolean, false>;

  /**
   * Position of the thumb bounding the selected span from below, expressed in
   * the slider's own range. Only used by a ranged slider.
   */
  valueLeft?: WithDefault<Double, 0>;

  /**
   * Position of the thumb bounding the selected span from above, expressed in
   * the slider's own range. Only used by a ranged slider.
   */
  valueRight?: WithDefault<Double, 1>;

  /**
   * Granularity the slider's values snap to: every value it reports is a
   * multiple of this. 0 means no granularity.
   */
  step?: WithDefault<Double, 0>;

  /**
   * Lowest position a thumb can be dragged to, expressed in the slider's own
   * range. The track is still drawn from `minimumValue`.
   */
  lowerLimit?: WithDefault<Double, 0>;

  /**
   * Highest position a thumb can be dragged to, expressed in the slider's own
   * range. The track is still drawn up to `maximumValue`.
   */
  upperLimit?: WithDefault<Double, 1>;

  /**
   * Axis the slider is laid out along. A vertical slider holds its lowest
   * value at the bottom and its highest at the top.
   */
  orientation?: WithDefault<'horizontal' | 'vertical', 'horizontal'>;

  /**
   * Emitted continuously while the user drags the thumb.
   */
  onValueChange?: DirectEventHandler<SliderValueChangeEvent>;

  /**
   * Emitted continuously while the user drags the lower thumb of a ranged
   * slider.
   */
  onLeftValueChange?: DirectEventHandler<SliderValueChangeEvent>;

  /**
   * Emitted continuously while the user drags the upper thumb of a ranged
   * slider.
   */
  onRightValueChange?: DirectEventHandler<SliderValueChangeEvent>;

  /**
   * Emitted once the user grabs a thumb, before it has moved anywhere. A
   * ranged slider reports whichever of its thumbs was grabbed first, and does
   * not report the second one being grabbed on top of it.
   */
  onSlidingStart?: DirectEventHandler<null>;

  /**
   * Emitted once the user lets go of the thumb they were dragging, whether or
   * not the drag moved it. A ranged slider reports the last of its thumbs
   * being let go of, so that every start is answered by exactly one complete.
   */
  onSlidingComplete?: DirectEventHandler<null>;
}

export default codegenNativeComponent<NativeProps>('RNCSlider', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
