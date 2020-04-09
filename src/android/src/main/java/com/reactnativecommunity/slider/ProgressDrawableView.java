package com.reactnativecommunity.slider;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Point;
import android.graphics.PointF;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.ShapeDrawable;
import android.graphics.drawable.shapes.RectShape;
import android.view.View;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.views.view.ReactViewGroup;
import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;

class ProgressDrawableView extends ReactViewGroup {

  private @SliderDrawable int mType;
  private final EraserDrawable mEraser = new EraserDrawable();

  public ProgressDrawableView(Context context) {
    super(context);
  }

  @Override
  protected boolean verifyDrawable(@NonNull Drawable who) {
    return who == mEraser || super.verifyDrawable(who);
  }

  void setType(@SliderDrawable int type) {
    mType = type;
  }

  @Override
  protected void onDraw(Canvas canvas) {
    super.onDraw(canvas);
    mEraser.draw(canvas);
  }

  /*
    private Point getIntrinsicTrackSize() {
      //Drawable drawable = reactSliderContainer.getSlider().getProgressDrawable();
      //return new Point(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight());
    }

    private void updateTrackSize() {
      UIManagerModule uiManagerModule = ((ReactContext) reactSliderContainer.getContext()).getNativeModule(UIManagerModule.class);
      //uiManagerModule.getUIImplementation().resolveShadowNode().setStyleMaxWidth();
      //uiManagerModule.updateNodeSize(maxTrack.getId(), mBounds.width(), getHeight());
      //uiManagerModule.updateNodeSize(minTrack.getId(), mBounds.width(), getHeight());
    }


   */
  static class EraserDrawable extends ShapeDrawable {
    EraserDrawable(Rect bounds) {
      this();
      setBounds(bounds);
    }

    EraserDrawable() {
      super(new RectShape());
      Paint paint = getPaint();
      paint.setColor(Color.TRANSPARENT);
      paint.setAntiAlias(true);
      paint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.CLEAR));
    }
  }
}
