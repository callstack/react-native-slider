// flow strict-local

import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
import type {HostComponent} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {Props as SliderProps} from '../js/Slider';

type NativeProps = $ReadOnly<{|
  ...ViewProps,
  ...SliderProps,
|}>;

export default (codegenNativeComponent<NativeProps>(
  'Slider',
): HostComponent<NativeProps>);
