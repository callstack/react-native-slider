import React, {FC} from 'react';
import {Image, ImageURISource, View} from 'react-native';
import {styles} from '../utils/styles';

export type MarkerProps = {
  stepMarked: boolean;
  currentValue: number;
  index: number;
  min: number;
  max: number;
};

export type TrackMarksProps = {
  isTrue: boolean;
  index: number;
  thumbImage?: ImageURISource;
  StepMarker?: FC<MarkerProps>;
  currentValue: number;
  min: number;
  max: number;
};

export const SliderTrackMark = ({
  isTrue,
  index,
  thumbImage,
  StepMarker,
  currentValue,
  min,
  max,
}: TrackMarksProps) => {
  return (
    <View style={styles.trackMarkContainer}>
      {StepMarker ? (
        <StepMarker
          stepMarked={isTrue}
          index={index}
          currentValue={currentValue}
          min={min}
          max={max}
        />
      ) : null}
      {thumbImage && isTrue ? (
        <View style={styles.thumbImageContainer}>
          <Image source={thumbImage} style={styles.thumbImage} />
        </View>
      ) : null}
    </View>
  );
};
