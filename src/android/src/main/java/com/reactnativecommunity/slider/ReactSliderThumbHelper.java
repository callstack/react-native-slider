package com.reactnativecommunity.slider;

import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.drawable.BitmapDrawable;
import android.os.Build;
import android.view.View;

import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;

public class ReactSliderThumbHelper extends DrawableHelper {
  ReactSliderThumbHelper(ViewDrawableContainer drawableContainer) {
    super(drawableContainer);
  }

  @Override
  void tryAttach(int index, View view) {
    if (index == SliderDrawable.THUMB) {
      attach(view);
    }
  }

}
