import {Platform, StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? 40 : undefined,
  },
  sliderStyle: {
    alignContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    height: Platform.OS === 'ios' ? 40 : undefined,
  },
  stepNumber: {
    marginTop: 20,
    alignItems: 'center',
    position: 'absolute',
  },
  stepsIndicator: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: Platform.OS === 'ios' ? 10 : 0,
    zIndex: 2,
  },
  trackMarkContainer: {
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 3,
  },
  thumbImageContainer: {
    position: 'absolute',
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  thumbImage: {
    alignContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  stepIndicatorElement: {
    alignItems: 'center',
    alignContent: 'center',
  },
});
