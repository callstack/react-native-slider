package com.reactnativecommunity.slider.ReactSliderDrawable;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.view.View;

import com.facebook.react.bridge.ReactContext;
import com.reactnativecommunity.slider.ReactSlider;

class ProgressDrawableHandler extends DrawableHandler {
  final ReactSlider mSlider;
  private final int mLayerID;
  private Integer mColor;
  private ReactDrawable mDrawableWrapper;
  private Drawable mDrawable;

  static Drawable getDrawable(ReactSlider slider, int layerID) {
    LayerDrawable drawable = (LayerDrawable) slider.getProgressDrawable().getCurrent();
    return drawable.findDrawableByLayerId(layerID);
  }

  public ProgressDrawableHandler(ReactSlider slider, int layerID) {
    super((ReactContext) slider.getContext(), getDrawable(slider, layerID));
    mSlider = slider;
    mLayerID = layerID;
  }

  Drawable wrapDrawable(Drawable drawable, Class<? extends ReactDrawable> factory) {
    factory.newInstance()
    mDrawable = drawable;
    if (mDrawableWrapper == null) {
      mDrawableWrapper = new ReactDrawable(mDrawable) {
        @Override
        protected void onBoundsChange(Rect bounds) {
          //mDrawable.setBounds(bounds);
        }
      };
    } else {
      //mDrawable.setBounds(mDrawableWrapper.getBounds());
      mDrawableWrapper.setDrawable(mDrawable);
      //mDrawableWrapper.setLevel(mDrawable.getLevel());
    }
    return mDrawableWrapper;
  }

  @Override
  Drawable createDrawable(Resources res, Bitmap bitmap) {
    return wrapDrawable(new BitmapDrawable(res, bitmap));
  }

  @Override
  public Drawable get() {
    return getDrawable(mSlider, mLayerID);
  }

  @Override
  public void set(Drawable drawable) {
    LayerDrawable outDrawable = (LayerDrawable) mSlider.getProgressDrawable().getCurrent();
    outDrawable.setDrawableByLayerId(mLayerID, drawable);
    outDrawable.setState(new int[]{});
    outDrawable.jumpToCurrentState();
    outDrawable.setState(new int[]{android.R.attr.state_enabled});
    outDrawable.jumpToCurrentState();
  }

  int getBarHeight() {
    return mSlider.getIndeterminateDrawable().getIntrinsicHeight();
  }

  @Override
  Rect getBounds() {
    return new Rect(0, 0, mSlider.getWidth(), mSlider.getHeight());
  }

  @Override
  public void draw(Canvas canvas, View view) {
    RectF bounds = new RectF(getBounds());
    RectF src = new RectF(0, 0, view.getWidth(), view.getHeight());
    float barHeight = Math.max(Math.min(bounds.height(), src.height()), getBarHeight());
    PointF scale = new PointF(bounds.width() / src.width(),barHeight / src.height());
    canvas.translate(0, (bounds.height() - barHeight) / 2);
    canvas.scale(scale.x, scale.y);
    view.draw(canvas);
  }
}
