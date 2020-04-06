package com.reactnativecommunity.slider.drawables;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Camera;
import android.graphics.Canvas;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.os.Build;
import android.view.View;

import androidx.annotation.FloatRange;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.facebook.react.uimanager.ReactTransformHelper;

public class ReactDrawable extends LayerDrawable implements ReactTransformHelper.Transformable {
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

  interface DrawableChild {
    PointF getCenter();
  }

  ReactDrawable(Resources res, Bitmap bitmap, View view) {
    this(new BitmapDrawable(res, bitmap), view);
  }

  ReactDrawable(Drawable drawable, View view) {
    this(new Drawable[]{drawable}, view);
  }

  ReactDrawable(Drawable[] drawables, View view) {
    this(drawables);
    applyTransformations(view, this);
  }

  private ReactDrawable(Drawable[] drawables) {
    super(drawables);
  }

  @RequiresApi(api = Build.VERSION_CODES.M)
  @Override
  public void setDrawable(int index, Drawable drawable) {
    drawable.setLevel(getDrawable(index).getLevel());
    super.setDrawable(index, drawable);
    onBoundsChange(copyBounds());
  }

  private static void applyTransformations(ReactDrawable from, ReactDrawable to) {
    to.mScaleX = from.mScaleX;
    to.mScaleY = from.mScaleY;
    to.mTranslationX = from.mTranslationX;
    to.mTranslationY = from.mTranslationY;
    to.mRotationX = from.mRotationX;
    to.mRotationY = from.mRotationY;
    to.mRotation = from.mRotation;
    to.mSkewX = from.mSkewX;
    to.mSkewY = from.mSkewY;
    to.setReactOpacity(from.mOpacity);
  }

  private static void applyTransformations(View from, ReactDrawable to) {
    to.mScaleX = from.getScaleX();
    to.mScaleY = from.getScaleY();
    to.mTranslationX = from.getTranslationX();
    to.mTranslationY = from.getTranslationY();
    to.mRotationX = from.getRotationX();
    to.mRotationY = from.getRotationY();
    to.mRotation = from.getRotation();
    //// TODO: 05/04/2020 skew
    //to.mSkewX = from.sk;
    //to.mSkewY = from.;
    to.setReactOpacity(from.getAlpha());
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

  public PointF getCenter() {
    Drawable drawable = getDrawable(0);
    if (drawable instanceof DrawableChild) {
      return ((DrawableChild) drawable).getCenter();
    } else {
      Rect bounds = getBounds();
      return new PointF(bounds.centerX(), bounds.centerY());
    }
  }

  @Override
  protected void onBoundsChange(Rect bounds) {
    for (int i = 0; i < getNumberOfLayers(); i++) {
      getDrawable(i).setBounds(bounds);
    }
  }

  void onPreDraw(Canvas canvas) {
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
  }

  @Override
  public void draw(@NonNull Canvas canvas) {
    canvas.save();
    onPreDraw(canvas);
    super.draw(canvas);
    canvas.restore();
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

  static class ReactDrawableHelper {
    ReactDrawable mDrawableWrapper;
    private final DrawableHandler mHandler;

    ReactDrawableHelper(DrawableHandler handler) {
      mHandler = handler;
    }

    ReactDrawable newInstance(Drawable drawable) {
      return new ReactDrawable(drawable, mHandler.getView());
    }

    ReactDrawable createDrawable(Drawable drawable) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && mDrawableWrapper != null) {
        mDrawableWrapper.setDrawable(0, drawable);
      } else {
        mDrawableWrapper = newInstance(drawable);
      }
      return mDrawableWrapper;
    }
  }
}
