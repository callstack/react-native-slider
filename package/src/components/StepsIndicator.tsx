import React, {FC, Fragment} from 'react';
import {View, Platform} from 'react-native';
import {StepNumber} from './StepNumber';
import {MarkerProps, SliderTrackMark} from './TrackMark';
//@ts-ignore
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource';

export const StepsIndicator = ({
  options,
  sliderWidth,
  currentValue,
  customStepMarker,
  renderStepNumber,
  thumbImage,
}: {
  options: number[];
  sliderWidth: number;
  currentValue?: number;
  customStepMarker?: FC<MarkerProps> | boolean;
  renderStepNumber?: boolean;
  thumbImage?: ImageSource;
}) => {
  return (
    <View
      pointerEvents="none"
      style={{
        flex: 1,
        marginHorizontal: sliderWidth * 0.033,
        flexDirection: 'row',
        justifyContent: 'space-between',
        top: Platform.OS === 'ios' ? -25 : -15,
        zIndex: 2,
      }}>
      {options.map((i, index) => {
        return (
          <Fragment key={index}>
            <View
              style={{
                alignItems: 'center',
              }}>
              <SliderTrackMark
                key={`${index}-SliderTrackMark`}
                isTrue={currentValue === i}
                thumbImage={thumbImage}
                StepMarker={customStepMarker}
              />
              {renderStepNumber ? (
                <StepNumber
                  i={i}
                  style={{fontSize: options.length > 9 ? 8 : 12}}
                  key={`${index}th-step`}
                />
              ) : null}
            </View>
          </Fragment>
        );
      })}
    </View>
  );
};
