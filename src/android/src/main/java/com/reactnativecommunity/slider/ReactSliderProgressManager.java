package com.reactnativecommunity.slider;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

public class ReactSliderProgressManager extends ViewGroupManager<ProgressDrawableView> {

  private static final String REACT_CLASS = "RNCSliderProgress";

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @NonNull
  @Override
  protected ProgressDrawableView createViewInstance(@NonNull ThemedReactContext reactContext) {
    return new ProgressDrawableView(reactContext);
  }

  @ReactProp(name = "type")
  public void setProgressType(ProgressDrawableView view, @ReactSliderDrawableHelper.SliderDrawable int type) {
    view.setType(type);
  }
}
