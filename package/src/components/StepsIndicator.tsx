import React, {FC, Fragment, useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {StepNumber} from './StepNumber';
import {MarkerProps, SliderTrackMark} from './TrackMark';
//@ts-ignore
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';
import {styles} from '../utils/styles';
import {constants} from '../utils/constants';

export const StepsIndicator = ({
  options,
  sliderWidth,
  currentValue,
  StepMarker,
  renderStepNumber,
  thumbImage,
  isLTR,
}: {
  options: number[];
  sliderWidth: number;
  currentValue: number;
  StepMarker?: FC<MarkerProps>;
  renderStepNumber?: boolean;
  thumbImage?: ImageSource;
  isLTR?: boolean;
}) => {
  const stepNumberFontStyle = useMemo(() => {
    return {
      fontSize:
        options.length > 9
          ? constants.STEP_NUMBER_TEXT_FONT_SMALL
          : constants.STEP_NUMBER_TEXT_FONT_BIG,
    };
  }, [options.length]);
  const values = isLTR ? options.reverse() : options;

  const renderStepIndicator = useCallback(
    (i: number, index: number) => {
      return (
        <Fragment key={index}>
          <View style={styles.stepIndicatorElement} key={`${index}-View`}>
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
    ],
  );

  return (
    <View
      pointerEvents="none"
      style={[
        styles.stepsIndicator,
        {marginHorizontal: sliderWidth * constants.MARGIN_HORIZONTAL_PADDING},
      ]}>
      {values.map((i, index) => renderStepIndicator(i, index))}
    </View>
  );
};
