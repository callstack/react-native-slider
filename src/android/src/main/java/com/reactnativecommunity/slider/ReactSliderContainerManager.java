package com.reactnativecommunity.slider;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;
import com.reactnativecommunity.slider.ReactSliderProgressHelper.ResizeMode;

public class ReactSliderContainerManager extends ViewGroupManager<ReactSliderContainerImpl> {
  private final static String REACT_CLASS = "RNCSliderContainer";

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @NonNull
  @Override
  protected ReactSliderContainerImpl createViewInstance(@NonNull ThemedReactContext reactContext) {
    return new ReactSliderContainerImpl(reactContext);
  }

  @ReactProp(name = "inverted", defaultBoolean = false)
  public void setInverted(ReactSliderContainerImpl view, boolean inverted) {
    view.setInverted(inverted);
  }

  @ReactProp(name = "thumbState", defaultBoolean = false)
  public void setThumbState(ReactSliderContainerImpl view, boolean state) {
    view.setState(SliderDrawable.THUMB, state);
  }

  @ReactProp(name = "minimumTrackState", defaultBoolean = false)
  public void setMinimumTrackState(ReactSliderContainerImpl view, boolean state) {
    view.setState(SliderDrawable.MINIMUM_TRACK, state);
  }

  @ReactProp(name = "minimumTrackResizeMode")
  public void setMinimumTrackResizeMode(ReactSliderContainerImpl view, @ResizeMode String resizeMode) {
    view.setResizeMode(SliderDrawable.MINIMUM_TRACK, resizeMode);
  }

  @ReactProp(name = "maximumTrackState", defaultBoolean = false)
  public void setMaximumTrackState(ReactSliderContainerImpl view, boolean state) {
    view.setState(SliderDrawable.MAXIMUM_TRACK, state);
  }

  @ReactProp(name = "maximumTrackResizeMode")
  public void setMaximumTrackResizeMode(ReactSliderContainerImpl view, @ResizeMode String resizeMode) {
    view.setResizeMode(SliderDrawable.MAXIMUM_TRACK, resizeMode);
  }
}
