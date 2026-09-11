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
}

export default codegenNativeComponent<NativeProps>('RNCSlider', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
