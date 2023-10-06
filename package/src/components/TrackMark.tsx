import React, {FC} from 'react';
import {Image, ImageURISource, StyleSheet, View} from 'react-native';

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
    <View style={{alignContent: 'center', justifyContent: 'center'}}>
      {StepMarker && typeof StepMarker !== 'boolean' ? (
        <StepMarker stepMarked={isTrue} />
      ) : (
        <View
          style={isTrue ? customizingStyles.outerTrue : customizingStyles.outer}
        />
      )}
      {thumbImage && isTrue ? (
        <View style={[customizingStyles.outerTrue, {position: 'absolute'}]}>
          <Image source={thumbImage} style={{position: 'absolute'}} />
        </View>
      ) : null}
    </View>
  );
};

const customizingStyles = StyleSheet.create({
  outer: {
    width: 3,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#11FF11',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerTrue: {
    width: 3,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#0F0FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: 1,
    height: 1,
    borderRadius: 1,
    backgroundColor: '#111111',
  },
  innerTrue: {
    width: 1,
    height: 1,
    borderRadius: 1,
    backgroundColor: '#0F0FFF',
  },
});
