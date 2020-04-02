package com.facebook.react.uimanager;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;

/**
 * {@link BaseViewManager}
 */
public class ReactTransformHelper {

  private static final int PERSPECTIVE_ARRAY_INVERTED_CAMERA_DISTANCE_INDEX = 2;
  private static final float CAMERA_DISTANCE_NORMALIZATION_MULTIPLIER = (float) Math.sqrt(5);

  private static MatrixMathHelper.MatrixDecompositionContext sMatrixDecompositionContext =
      new MatrixMathHelper.MatrixDecompositionContext();
  private static double[] sTransformDecompositionArray = new double[16];

  public interface Transformable {
    void setTranslationX(float translationX);
    void setTranslationY(float translationY);
    void setRotation(float rotation);
    void setRotationX(float rotationX);
    void setRotationY(float rotationY);
    void setScaleX(float scaleX);
    void setScaleY(float scaleY);
    void setSkewX(float skewX);
    void setSkewY(float skewY);
    void setCameraDistance(float distance);
  }

  public static void setTransform(@NonNull Transformable transformable, @Nullable ReadableArray matrix) {
    if (matrix == null) {
      resetTransformProperty(transformable);
    } else {
      setTransformProperty(transformable, matrix);
    }
  }

  private static void setTransformProperty(@NonNull Transformable transformable, ReadableArray transforms) {
    TransformHelper.processTransform(transforms, sTransformDecompositionArray);
    MatrixMathHelper.decomposeMatrix(sTransformDecompositionArray, sMatrixDecompositionContext);
    transformable.setTranslationX(
        PixelUtil.toPixelFromDIP((float) sMatrixDecompositionContext.translation[0]));
    transformable.setTranslationY(
        PixelUtil.toPixelFromDIP((float) sMatrixDecompositionContext.translation[1]));
    transformable.setRotation((float) sMatrixDecompositionContext.rotationDegrees[2]);
    transformable.setRotationX((float) sMatrixDecompositionContext.rotationDegrees[0]);
    transformable.setRotationY((float) sMatrixDecompositionContext.rotationDegrees[1]);
    // added skew support
    transformable.setSkewX((float) sMatrixDecompositionContext.skew[0]);
    transformable.setSkewY((float) sMatrixDecompositionContext.skew[1]);
    //
    transformable.setScaleX((float) sMatrixDecompositionContext.scale[0]);
    transformable.setScaleY((float) sMatrixDecompositionContext.scale[1]);

    double[] perspectiveArray = sMatrixDecompositionContext.perspective;

    if (perspectiveArray.length > PERSPECTIVE_ARRAY_INVERTED_CAMERA_DISTANCE_INDEX) {
      float invertedCameraDistance =
          (float) perspectiveArray[PERSPECTIVE_ARRAY_INVERTED_CAMERA_DISTANCE_INDEX];
      if (invertedCameraDistance == 0) {
        // Default camera distance, before scale multiplier (1280)
        invertedCameraDistance = 0.00078125f;
      }
      float cameraDistance = -1 / invertedCameraDistance;
      float scale = DisplayMetricsHolder.getScreenDisplayMetrics().density;

      // The following converts the matrix's perspective to a camera distance
      // such that the camera perspective looks the same on Android and iOS.
      // The native Android implementation removed the screen density from the
      // calculation, so squaring and a normalization value of
      // sqrt(5) produces an exact replica with iOS.
      // For more information, see https://github.com/facebook/react-native/pull/18302
      float normalizedCameraDistance =
          scale * scale * cameraDistance * CAMERA_DISTANCE_NORMALIZATION_MULTIPLIER;
      transformable.setCameraDistance(normalizedCameraDistance);
    }
  }

  private static void resetTransformProperty(@NonNull Transformable transformable) {
    transformable.setTranslationX(PixelUtil.toPixelFromDIP(0));
    transformable.setTranslationY(PixelUtil.toPixelFromDIP(0));
    transformable.setRotation(0);
    transformable.setRotationX(0);
    transformable.setRotationY(0);
    transformable.setScaleX(1);
    transformable.setScaleY(1);
    transformable.setCameraDistance(0);
  }
}
