package com.reactnativecommunity.slider.drawables;

import android.view.View;
import android.view.ViewTreeObserver;

class DrawListenerRegistry {
  static void registerListener(final View view, final ViewTreeObserver.OnDrawListener listener) {
    ViewTreeObserver treeObserver = view.getViewTreeObserver();
    try {
      treeObserver.addOnDrawListener(listener);
    } catch (Throwable throwable) {
      view.post(new Runnable() {
        @Override
        public void run() {
          registerListener(view, listener);
        }
      });
    }
  }

  static void unregisterListener(final View view, final ViewTreeObserver.OnDrawListener listener) {
    ViewTreeObserver treeObserver = view.getViewTreeObserver();
    try {
      treeObserver.removeOnDrawListener(listener);
    } catch (Throwable throwable) {
      view.post(new Runnable() {
        @Override
        public void run() {
          unregisterListener(view, listener);
        }
      });
    }
  }
}
