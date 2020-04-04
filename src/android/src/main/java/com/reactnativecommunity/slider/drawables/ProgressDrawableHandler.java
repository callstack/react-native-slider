package com.reactnativecommunity.slider.drawables;

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

abstract class ProgressDrawableHandler extends DrawableHandler {
  final ReactSlider mSlider;
  private final int mLayerID;
  private final ReactDrawable.ReactDrawableHelper mHelper = new ReactDrawable.ReactDrawableHelper();

  static Drawable getDrawable(ReactSlider slider, int layerID) {
    LayerDrawable drawable = (LayerDrawable) slider.getProgressDrawable().getCurrent();
    return drawable.findDrawableByLayerId(layerID);
  }

  ProgressDrawableHandler(ReactSlider slider, int layerID) {
    super((ReactContext) slider.getContext(), getDrawable(slider, layerID));
    mSlider = slider;
    mLayerID = layerID;
  }

  Drawable createDrawable(Drawable drawable) {
    return mHelper.createDrawable(drawable);
  }

  @Override
  Drawable createDrawable(Resources res, Bitmap bitmap) {
    return createDrawable(new BitmapDrawable(res, bitmap));
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

  private int getBarHeight() {
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

  static class ProgressBitmapDrawable extends BitmapDrawable implements ReactDrawable.DrawableChild {

    private float mLevelScale = 1;
    private final boolean mInverted;

    ProgressBitmapDrawable(Resources res, Bitmap bitmap) {
      this(res, bitmap, false);
    }

    ProgressBitmapDrawable(Resources res, Bitmap bitmap, boolean inverted) {
      super(res, bitmap);
      mInverted = inverted;
    }

    @Override
    protected boolean onLevelChange(int level) {
      mLevelScale = getLevel() * 1.f / ReactSliderDrawableHelper.MAX_LEVEL * 1.f;
      if (mInverted) mLevelScale = 1 - mLevelScale;
      return true;
    }

    @Override
    public PointF getCenter() {
      Rect bounds = getBounds();
      float x = bounds.centerX() * mLevelScale;
      if (mInverted) x = bounds.width() - x;
      return new PointF(x, bounds.centerY());
    }

    @Override
    public void draw(Canvas canvas) {
      if (mInverted) {
        Rect bounds = getBounds();
        canvas.translate(bounds.width() * (1 - mLevelScale), 0);
      }
      canvas.scale(mLevelScale, 1);
      super.draw(canvas);
    }
  }
}
