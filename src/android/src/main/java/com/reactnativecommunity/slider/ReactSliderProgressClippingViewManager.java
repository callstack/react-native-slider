package com.reactnativecommunity.slider;

import android.content.Context;
import android.graphics.Canvas;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.views.view.ReactViewGroup;

public class ReactSliderProgressClippingViewManager extends ViewGroupManager<ReactSliderProgressClippingViewManager.ProgressClippingView> {

  private static final String REACT_CLASS = "RNCSliderProgressClippingView";

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @NonNull
  @Override
  protected ProgressClippingView createViewInstance(@NonNull ThemedReactContext reactContext) {
    return new ProgressClippingView(reactContext);
  }

  static class ProgressClippingView extends ReactViewGroup {
    public ProgressClippingView(Context context) {
      super(context);
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
      int h = getRootView().getHeight();
      canvas.clipRect(0, -h, getWidth(), h + getHeight());
      super.dispatchDraw(canvas);
    }
  }
}
