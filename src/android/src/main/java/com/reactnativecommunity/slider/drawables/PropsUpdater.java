package com.reactnativecommunity.slider.drawables;

import com.facebook.react.uimanager.ReactStylesDiffMap;

interface PropsUpdater {
  void updateFromProps(int tag, ReactStylesDiffMap props);
}
