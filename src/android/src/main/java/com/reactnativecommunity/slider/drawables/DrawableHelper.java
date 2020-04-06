package com.reactnativecommunity.slider.drawables;

import android.graphics.Canvas;
import android.graphics.drawable.Drawable;

public interface DrawableHelper extends ReactDrawable.DrawableCenter {
  abstract Drawable get();
  abstract void onPreDraw(Canvas canvas);
}
