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
   * Emitted continuously while the user drags the thumb.
   */
  onValueChange?: DirectEventHandler<SliderValueChangeEvent>;
}

export default codegenNativeComponent<NativeProps>('RNCSlider', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
