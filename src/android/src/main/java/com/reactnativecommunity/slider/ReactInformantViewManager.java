package com.reactnativecommunity.slider;

import android.util.Log;
import android.util.SparseArray;
import android.util.SparseIntArray;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.views.slider.ReactSliderManager;
import com.facebook.react.views.view.ReactViewGroup;
import com.facebook.react.views.view.ReactViewManager;

public class ReactInformantViewManager extends ReactViewManager {

  public static class InformantRegistry {

    public interface InformAction<T> {
      void run(View target, int informantID, int recruiterID, T context);
    }

    public interface InformantTarget<T> {
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
    private boolean mInformDeep;

    InformantRegistry(ReactContext context, boolean informDeep) {
      mContext = context;
      mInformDeep = informDeep;
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
      traverseRegistration(receiver, informant, informant.getId(), informDeep);
    }

    synchronized void addSubInformant(View informant, View child, boolean informDeep) {
      View receiver = mInformantToReceiverRegistry.get(informant.getId());
      if (receiver != null) {
        traverseRegistration(
            receiver,
            child,
            mInformantToRecruiterRegistry.get(informant.getId()),
            informDeep);
      }
    }

    private void traverseRegistration(View receiver, View informant, int recruiterID, boolean informDeep) {
      mInformantToReceiverRegistry.put(informant.getId(), receiver);
      mInformantToRecruiterRegistry.put(informant.getId(), recruiterID);
      if (informant instanceof ViewGroup && informDeep) {
        ViewGroup viewGroup = (ViewGroup) informant;
        for (int i = 0; i < viewGroup.getChildCount(); i++) {
          traverseRegistration(receiver, viewGroup.getChildAt(i), recruiterID, true);
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
  public void addView(ReactViewGroup parent, View child, int index) {
    super.addView(parent, child, index);
    mInformantRegistry.addSubInformant(parent, child, true);
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
