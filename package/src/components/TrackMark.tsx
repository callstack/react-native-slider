import React, {FC} from 'react';
import {Image, ImageURISource, View} from 'react-native';
import {styles} from '../utils/styles';

export type MarkerProps = {
  stepMarked: boolean;
  currentValue?: number;
  index: number;
};

export type TrackMarksProps = {
  isTrue: boolean;
  thumbImage?: ImageURISource;
  StepMarker?: FC<MarkerProps>;
  currentValue?: number;
  index: number;
};

export const SliderTrackMark = ({
  isTrue,
  thumbImage,
  StepMarker,
  currentValue,
  index,
}: TrackMarksProps) => {
  return (
    <View style={styles.trackMarkContainer}>
      {StepMarker ? (
        <StepMarker
          index={index}
          stepMarked={isTrue}
          currentValue={currentValue}
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
