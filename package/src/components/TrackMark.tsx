import React, {FC} from 'react';
import {Image, ImageURISource, View} from 'react-native';
import {styles} from '../utils/styles';

export type MarkerProps = {
  stepMarked: boolean;
};

export type TrackMarksProps = {
  isTrue: boolean;
  thumbImage?: ImageURISource;
  StepMarker?: FC<MarkerProps> | boolean;
};

export const SliderTrackMark = ({
  isTrue,
  thumbImage,
  StepMarker,
}: TrackMarksProps) => {
  return (
    <View style={styles.trackMarkContainer}>
      {StepMarker && typeof StepMarker !== 'boolean' ? (
        <StepMarker stepMarked={isTrue} />
      ) : (
        <View
          style={
            isTrue ? styles.defaultIndicatorMarked : styles.defaultIndicatorIdle
          }
        />
      )}
      {thumbImage && isTrue ? (
        <View style={styles.thumbImageContainer}>
          <Image source={thumbImage} style={styles.thumbImage} />
        </View>
      ) : null}
    </View>
  );
};
