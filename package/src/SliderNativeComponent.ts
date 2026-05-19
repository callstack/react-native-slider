import {
  codegenNativeComponent,
  type HostComponent,
  type ViewProps,
} from "react-native";
import type {
  DirectEventHandler,
  Double,
  Float,
  Int32,
} from "react-native/Libraries/Types/CodegenTypes";

export type SliderChangeEvent = Readonly<{
  value: Double;
}>;

export interface NativeSliderProps extends ViewProps {
  step?: Int32;
  minValue?: Float;
  maxValue?: Float;
  onValueChange?: DirectEventHandler<SliderChangeEvent> | null;
}

export default codegenNativeComponent<NativeSliderProps>(
  "SliderView",
) as HostComponent<NativeSliderProps>;
