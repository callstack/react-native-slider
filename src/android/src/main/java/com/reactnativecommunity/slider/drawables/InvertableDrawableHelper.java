package com.reactnativecommunity.slider.drawables;

import android.graphics.Canvas;
import android.graphics.PointF;
import android.graphics.Rect;

import com.reactnativecommunity.slider.ReactSlider;
import com.reactnativecommunity.slider.ReactSliderManager;

public abstract class InvertableDrawableHelper implements DrawableHelper {

  private boolean mInverted;

  InvertableDrawableHelper(boolean inverted) {
    mInverted = inverted;
  }

  void setInverted(boolean inverted) {
    if (mInverted != inverted) {
      mInverted = inverted;
      get().invalidateSelf();
    }
  }

  @Override
  public PointF getCenter() {
    Rect bounds = get().getBounds();
    return new PointF(bounds.centerX(), bounds.centerY());
  }

  /**
   * reverse scaleX due to {@link ReactSliderManager#setInverted(ReactSlider, boolean)}
   * so that the thumb remains the same
   * @param canvas
   */
  @Override
  public void onPreDraw(Canvas canvas) {
    PointF center = getCenter();
    canvas.scale((mInverted ? -1 : 1), 1, center.x, center.y);
  }
}
