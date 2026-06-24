import React, {type FC, Fragment, useCallback, useMemo} from 'react';
import {Platform, View} from 'react-native';
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';

import {StepNumber} from './StepNumber';
import {type MarkerProps, SliderTrackMark} from './TrackMark';
import {constants} from '../utils/constants';
import {styles} from '../utils/styles';

export const StepsIndicator = ({
  options,
  sliderWidth,
  currentValue,
  StepMarker,
  renderStepNumber,
  thumbImage,
  isLTR,
  thumbSize,
}: {
  options: number[];
  sliderWidth: number;
  currentValue: number;
  StepMarker?: FC<MarkerProps>;
  renderStepNumber?: boolean;
  thumbImage?: ImageSource;
  isLTR?: boolean;
  thumbSize?: number;
}) => {
  const stepNumberFontStyle = useMemo(() => {
    return {
      fontSize:
        options.length > 9
          ? constants.STEP_NUMBER_TEXT_FONT_SMALL
          : constants.STEP_NUMBER_TEXT_FONT_BIG,
    };
  }, [options.length]);

  const platformDependentStyles = useMemo(() => {
    const isWeb = Platform.OS === 'web';
    const isIOS = Platform.OS === 'ios';
    const trackInset = isIOS
      ? (thumbSize || constants.IOS_DEFAULT_THUMB_SIZE) / 2
      : sliderWidth * constants.MARGIN_HORIZONTAL_PADDING;

    return {
      stepIndicatorContainerStyle: isWeb
        ? styles.stepsIndicator
        : isIOS
        ? {
            ...styles.stepsIndicator,
            left: trackInset,
            position: 'absolute' as const,
            right: trackInset,
          }
        : {
            ...styles.stepsIndicator,
            marginHorizontal: trackInset,
          },
      stepIndicatorElementStyle: isWeb
        ? {
            ...styles.stepIndicatorElement,
            width: constants.THUMB_SIZE,
            justifyContent: 'space-between' as const,
          }
        : styles.stepIndicatorElement,
    };
  }, [sliderWidth, thumbSize]);

  const values = useMemo(
    () => (isLTR ? [...options].reverse() : options),
    [isLTR, options],
  );

  const renderStepIndicator = useCallback(
    (i: number, index: number) => {
      return (
        <Fragment key={index}>
          <View
            style={platformDependentStyles.stepIndicatorElementStyle}
            key={`${index}-View`}>
            <SliderTrackMark
              key={`${index}-SliderTrackMark`}
              isTrue={currentValue === i}
              index={i}
              thumbImage={thumbImage}
              StepMarker={StepMarker}
              currentValue={currentValue}
              min={options[0]}
              max={options[options.length - 1]}
            />
            {renderStepNumber ? (
              <StepNumber
                i={i}
                index={index}
                style={stepNumberFontStyle}
                key={`${index}th-step`}
              />
            ) : null}
          </View>
        </Fragment>
      );
    },
    [
      currentValue,
      StepMarker,
      options,
      thumbImage,
      renderStepNumber,
      stepNumberFontStyle,
      platformDependentStyles.stepIndicatorElementStyle,
    ],
  );

  return (
    <View
      testID="StepsIndicator-Container"
      style={[
        platformDependentStyles.stepIndicatorContainerStyle,
        {pointerEvents: 'none'},
      ]}>
      {values.map((i, index) => renderStepIndicator(i, index))}
    </View>
  );
};
