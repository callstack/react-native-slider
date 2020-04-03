package com.reactnativecommunity.slider.ReactSliderDrawable;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Camera;
import android.graphics.Canvas;
import android.graphics.ColorFilter;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;

import androidx.annotation.FloatRange;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.facebook.react.uimanager.ReactTransformHelper;

public class ReactDrawable extends Drawable implements ReactTransformHelper.Transformable {
  private float mScaleX = 1;
  private float mScaleY = 1;
  private float mTranslationX = 0;
  private float mTranslationY = 0;
  private float mRotationX = 0;
  private float mRotationY = 0;
  private float mRotation = 0;
  private float mSkewX = 0;
  private float mSkewY = 0;
  private float mOpacity = 0;
  private Camera mRotator = new Camera();
  private Drawable mDrawable;

  public ReactDrawable(Resources res, Bitmap bitmap) {
    this(new BitmapDrawable(res, bitmap));
  }

  ReactDrawable(Drawable drawable) {
    mDrawable = drawable;
  }

  @Override
  public void setAlpha(int alpha) {
    mDrawable.setAlpha(alpha);
  }

  @Override
  public void setColorFilter(@Nullable ColorFilter colorFilter) {
    mDrawable.setColorFilter(colorFilter);
  }

  @Override
  public int getOpacity() {
    return mDrawable.getOpacity();
  }

  @Override
  protected boolean onStateChange(int[] state) {
    return mDrawable.setState(state);
  }

  @Override
  protected boolean onLevelChange(int level) {
    return mDrawable.setLevel(level);
  }

  public void setDrawable(Drawable drawable) {
    mDrawable = drawable;
    mDrawable.setState(getState());
    mDrawable.setLevel(getLevel());
    invalidateSelf();
  }

  public void updateFromProps(ReactStylesDiffMap props) {
    boolean invalidate = false;
    if (props.hasKey("opacity")) {
      setReactOpacity((float) props.getDouble("opacity", mOpacity));
      invalidate = true;
    }
    if (props.hasKey("transform")) {
      setTransform(props.getArray("transform"));
      invalidate = true;
    }
    if (invalidate) {
      invalidateSelf();
    }
  }

  void setTransform(ReadableArray transforms) {
    ReactTransformHelper.setTransform(this, transforms);
  }

  PointF getCenter() {
    Rect bounds = getBounds();
    return new PointF(bounds.centerX(), bounds.centerY());
  }

  @Override
  public void draw(@NonNull Canvas canvas) {
    PointF center = getCenter();
    // apply translation
    canvas.translate(mTranslationX, mTranslationY);
    // apply skew
    canvas.skew(mSkewX, mSkewY);
    // apply 3D rotation
    mRotator.save();
    mRotator.translate(center.x, -center.y, 0);
    mRotator.rotate(mRotationX, mRotationY, mRotation);
    mRotator.translate(-center.x, center.y, 0);
    mRotator.applyToCanvas(canvas);
    mRotator.restore();
    // apply scale
    canvas.scale(mScaleX, mScaleY, center.x, center.y);
    mDrawable.draw(canvas);
  }

  public float getScaleX() {
    return mScaleX;
  }

  @Override
  public void setScaleX(float scaleX) {
    mScaleX = scaleX;
  }

  public float getScaleY() {
    return mScaleY;
  }

  @Override
  public void setScaleY(float scaleY) {
    mScaleY = scaleY;
  }

  public float getRotation() {
    return mRotation;
  }

  @Override
  public void setRotation(float rotation) {
    mRotation = rotation;
  }

  public float getRotationX() {
    return mRotationX;
  }

  @Override
  public void setRotationX(float rotationX) {
    mRotationX = rotationX;
  }

  public float getRotationY() {
    return mRotationY;
  }

  @Override
  public void setRotationY(float rotationY) {
    mRotationY = rotationY;
  }

  public float getReactOpacity() {
    return mOpacity;
  }

  public void setReactOpacity(@FloatRange(from = 0, to = 1) float opacity) {
    mOpacity = Math.max(Math.min(opacity, 1), 0);
    setAlpha((int) (mOpacity * 255));
  }

  public float getTranslationX() {
    return mTranslationX;
  }

  @Override
  public void setTranslationX(float translationX) {
    mTranslationX = translationX;
  }

  public float getTranslationY() {
    return mTranslationY;
  }

  @Override
  public void setTranslationY(float translationY) {
    mTranslationY = translationY;
  }

  @Override
  public void setCameraDistance(float distance) {

  }

  public float getSkewX() {
    return mSkewX;
  }

  @Override
  public void setSkewX(float skewX) {
    this.mSkewX = skewX;
  }

  public float getSkewY() {
    return mSkewY;
  }

  @Override
  public void setSkewY(float skewY) {
    this.mSkewY = skewY;
  }
}
