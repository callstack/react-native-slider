import React, {FC} from 'react';
import {Image, ImageURISource, View} from 'react-native';
import {styles} from '../utils/styles';

export type MarkerProps = {
  stepMarked: boolean;
  value: number;
};

export type TrackMarksProps = {
  isTrue: boolean;
  value: number;
  thumbImage?: ImageURISource;
  StepMarker?: FC<MarkerProps>;
};

export const SliderTrackMark = ({
  isTrue,
  value,
  thumbImage,
  StepMarker,
}: TrackMarksProps) => {
  return (
    <View style={styles.trackMarkContainer}>
      {StepMarker ? <StepMarker stepMarked={isTrue} value={value} /> : null}
      {thumbImage && isTrue ? (
        <View style={styles.thumbImageContainer}>
          <Image source={thumbImage} style={styles.thumbImage} />
        </View>
      ) : null}
    </View>
  );
};
