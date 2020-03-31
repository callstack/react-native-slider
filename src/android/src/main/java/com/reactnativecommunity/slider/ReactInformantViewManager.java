package com.reactnativecommunity.slider;

import android.util.Log;
import android.util.SparseArray;
import android.util.SparseIntArray;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.common.ReactConstants;
import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.views.slider.ReactSliderManager;
import com.facebook.react.views.view.ReactViewGroup;
import com.facebook.react.views.view.ReactViewManager;

public class ReactInformantViewManager extends ReactViewManager {

  static class InformantRegistry {

    interface InformAction<T> {
      void run(View target, int informantID, int recruiterID, T context);
    }

    interface InformantTarget<T> {
      void receiveFromInformant(int informantID, int recruiterID, T context);
    }

    private SparseArray<View> mInformantToReceiverRegistry = new SparseArray<>();
    private SparseIntArray mInformantToRecruiterRegistry = new SparseIntArray();

    private static InformAction sAction = new InformAction() {
      @Override
      public void run(View target, int informantID, int recruiterID, Object context) {
        if (target instanceof InformantTarget) {
          ((InformantTarget) target).receiveFromInformant(informantID, recruiterID, context);
        }
      }
    };

    private final ReactContext mContext;

    InformantRegistry(ReactContext context) {
      mContext = context;
    }

    void add(final View receiver, final int informantID, final boolean informDeep) {
      if (informDeep) {
        Runnable action = new Runnable() {
          @Override
          public void run() {
            try {
              View informant = mContext.getNativeModule(UIManagerModule.class).resolveView(informantID);
              add(receiver, informant, true);
            } catch (Throwable throwable) {
              Log.w(ReactSliderManager.REACT_CLASS, "unable to add informant", throwable);
            }
          }
        };
        if (UiThreadUtil.isOnUiThread()) {
          action.run();
        } else {
          UiThreadUtil.runOnUiThread(action);
        }
      } else {
        mInformantToReceiverRegistry.put(informantID, receiver);
        mInformantToRecruiterRegistry.put(informantID, informantID);
      }
    }

    synchronized void add(View receiver, View informant, boolean informDeep) {
      traverseRegistration(receiver, informant, informant, informDeep);
    }

    private void traverseRegistration(View receiver, View informant, View recruiter, boolean informDeep) {
      mInformantToReceiverRegistry.put(informant.getId(), receiver);
      mInformantToRecruiterRegistry.put(informant.getId(), recruiter.getId());
      if (informant instanceof ViewGroup && informDeep) {
        ViewGroup viewGroup = (ViewGroup) informant;
        for (int i = 0; i < viewGroup.getChildCount(); i++) {
          traverseRegistration(receiver, viewGroup.getChildAt(i), recruiter, true);
        }
      }
    }

    void remove(View informant) {
      mInformantToReceiverRegistry.delete(informant.getId());
    }

    void remove(int informantTag) {
      mInformantToReceiverRegistry.delete(informantTag);
    }

    <T> void inform(View informant, T context) {
      inform(informant, context, sAction);
    }

    <T> void inform(View informant, T context, InformAction<T> action) {
      int informantID = informant.getId();
      View target = mInformantToReceiverRegistry.get(informantID, null);
      int recruiterID = mInformantToRecruiterRegistry.get(informantID, -1);
      action.run(target, informantID, recruiterID, context);
    }
  }

  private final InformantRegistry mInformantRegistry;

  ReactInformantViewManager(InformantRegistry registry) {
    super();
    mInformantRegistry = registry;
  }

  @Override
  public void onDropViewInstance(@NonNull ReactViewGroup view) {
    super.onDropViewInstance(view);
    mInformantRegistry.remove(view.getId());
  }

  @Override
  public void updateProperties(@NonNull ReactViewGroup viewToUpdate, ReactStylesDiffMap props) {
    super.updateProperties(viewToUpdate, props);
    mInformantRegistry.inform(viewToUpdate, props);
  }

}
