import {Platform, StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  stepNumber: {
    marginTop: 20,
    alignItems: 'center',
    position: 'absolute',
  },
  sliderMainContainer: {zIndex: 1, width: '100%'},
  defaultSlideriOS: {
    height: 40,
  },
  defaultSlider: {},
  stepsIndicator: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: Platform.OS === 'ios' ? -20 : -15,
    zIndex: 2,
  },
  trackMarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImageContainer: {
    position: 'absolute',
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImage: {
    position: 'absolute',
  },
  stepIndicatorElement: {
    alignItems: 'center',
  },
  defaultIndicatorMarked: {
    height: 20,
    width: 5,
    backgroundColor: "#CCCCCC"
  },
  defaultIndicatorIdle: {
    height: 10,
    width: 2,
    backgroundColor: "#C0C0C0"
  }
});
