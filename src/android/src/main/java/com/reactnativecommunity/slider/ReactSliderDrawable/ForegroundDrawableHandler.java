package com.reactnativecommunity.slider.ReactSliderDrawable;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;

import com.reactnativecommunity.slider.ReactSlider;

public class ForegroundDrawableHandler extends ProgressDrawableHandler {
  public ForegroundDrawableHandler(ReactSlider slider) {
    super(slider, android.R.id.progress);
  }

  @Override
  Drawable createDrawable(Resources res, Bitmap bitmap) {
    final UpdatingBitmapDrawable drawable = new UpdatingBitmapDrawable(res, bitmap, get().getLevel());
    return new ReactDrawable(drawable) {
      @Override
      PointF getCenter() {
        return drawable.getCenter();
      }
    };
  }

  private class UpdatingBitmapDrawable extends BitmapDrawable {

    private float mLevelScale = 1;

    UpdatingBitmapDrawable(Resources res, Bitmap bitmap, int level) {
      super(res, bitmap);
      setLevel(level);
    }

    @Override
    protected boolean onLevelChange(int level) {
      mLevelScale = getLevel() * 1.f / ReactSliderDrawableHelper.MAX_LEVEL * 1.f;
      return true;
    }

    PointF getCenter() {
      Rect bounds = getBounds();
      return new PointF(bounds.centerX() * mLevelScale, bounds.centerY());
    }

    @Override
    public void draw(Canvas canvas) {
      canvas.scale(mLevelScale, 1);
      super.draw(canvas);
    }
  }
}
