import React, {FC} from 'react';
import {Image, ImageURISource, View} from 'react-native';
import {styles} from '../utils/styles';

export type MarkerProps = {
  stepMarked: boolean;
  currentValue?: number;
};

export type TrackMarksProps = {
  isTrue: boolean;
  thumbImage?: ImageURISource;
  StepMarker?: FC<MarkerProps>;
  currentValue?: number;
};

export const SliderTrackMark = ({
  isTrue,
  thumbImage,
  StepMarker,
  currentValue,
}: TrackMarksProps) => {
  return (
    <View style={styles.trackMarkContainer}>
      {StepMarker ? (
        <StepMarker stepMarked={isTrue} currentValue={currentValue} />
      ) : null}
      {thumbImage && isTrue ? (
        <View style={styles.thumbImageContainer}>
          <Image source={thumbImage} style={styles.thumbImage} />
        </View>
      ) : null}
    </View>
  );
};
