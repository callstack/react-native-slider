package com.reactnativecommunity.slider.drawables;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.util.SparseArray;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ReactStylesDiffMap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

public class ReactDrawableGroup extends ReactDrawable {

  static ReactDrawableGroup obtain(DrawableHandler handler) {
    return Builder.obtain(handler);
  }

  static class ReactRootDrawableGroup extends ReactDrawableGroup implements PropsUpdater {

    private final SparseArray<ReactDrawableGroup> mRegistry;

    ReactRootDrawableGroup(View id, Drawable base, HashMap<View, ReactDrawableGroup> map, Drawable[] drawables) {
      super(id, base, map, drawables);
      mRegistry = new SparseArray<>();
      traverseRegistration(this);
    }

    void traverseRegistration(ReactDrawableGroup reactDrawable) {
      mRegistry.put(reactDrawable.mID.getId(), reactDrawable);
      for (Map.Entry<View, ReactDrawableGroup> next : reactDrawable.mDrawables.entrySet()) {
        traverseRegistration(next.getValue());
      }
    }

    @Override
    public void updateFromProps(int tag, ReactStylesDiffMap props) {
      ReactDrawableGroup d = mRegistry.get(tag);
      if (d != null) d.updateFromProps(props);
    }
  }

  private HashMap<View, ReactDrawableGroup> mDrawables;
  private View mID;
  private Drawable mBaseDrawable;

  ReactDrawableGroup(View id, Drawable base, HashMap<View, ReactDrawableGroup> map, Drawable[] drawables) {
    super(drawables, id);
    mID = id;
    mBaseDrawable = base;
    mDrawables = map;
  }

  private Drawable getDrawable(View view) {
    return view == mID ? mBaseDrawable : mDrawables.get(view);
  }

  @Override
  protected void onBoundsChange(Rect bounds) {
    traverseLayout(mID, null);
  }

  private void traverseLayout(View view, ViewGroup parent) {
    Drawable drawable = getDrawable(view);
    if (drawable == null) return;
    Rect out = new Rect();
    view.getDrawingRect(out);
    if (parent != null) {
      parent.offsetDescendantRectToMyCoords(view, out);
    }
    drawable.setBounds(out);
    if (view instanceof ViewGroup) {
      ViewGroup viewGroup = ((ViewGroup) view);
      for (int i = 0; i < viewGroup.getChildCount(); i++) {
        traverseLayout(viewGroup.getChildAt(i), viewGroup);
      }
    }
  }

  @Override
  public PointF getCenter() {
    Rect bounds = getBounds();
    return new PointF(bounds.width() / 2, bounds.height() / 2);
  }

  @Override
  public void draw(@NonNull Canvas canvas) {
    canvas.save();
    onPreDraw(canvas);
    mBaseDrawable.draw(canvas);
    if (mID instanceof ViewGroup) {
      ViewGroup viewGroup = ((ViewGroup) mID);
      for (int i = 0; i < viewGroup.getChildCount(); i++) {
        Rect out = new Rect();
        View c = viewGroup.getChildAt(i);
        c.getDrawingRect(out);
        viewGroup.offsetDescendantRectToMyCoords(c, out);
        canvas.save();
        canvas.translate(out.left, out.top);
        mDrawables.get(c).draw(canvas);
        canvas.restore();
      }
    }
    canvas.restore();
  }

  static class Builder {

    static ReactDrawableGroup obtain(DrawableHandler handler) {
      return traverse(handler.getView().getResources(), handler.getView(), handler.getBounds());
    }

    private static ReactDrawableGroup obtain(View id, Drawable bare, HashMap<View, ReactDrawableGroup> drawables, boolean isRoot) {
      Set<Map.Entry<View, ReactDrawableGroup>> entries = drawables.entrySet();
      Iterator<Map.Entry<View, ReactDrawableGroup>> iterator = entries.iterator();
      Drawable[] out = new Drawable[entries.size() + 1];
      int i = 0;
      out[i++] = bare;
      for (Map.Entry<View, ReactDrawableGroup> next : drawables.entrySet()) {
        out[i++] = next.getValue();
      }
      if (isRoot) {
        return new ReactRootDrawableGroup(id, bare, drawables, out);
      } else {
        return new ReactDrawableGroup(id, bare, drawables, out);
      }
    }

    private static void drawBareView(Canvas canvas, View view) {
      if (view.getParent() != null) {
        Rect r = new Rect();
        view.getDrawingRect(r);
        ((ViewGroup) view.getParent()).offsetDescendantRectToMyCoords(view, r);
      }
      if (view instanceof ViewGroup) {
        ArrayList<Integer> visibility = new ArrayList<>();
        View child;
        ViewGroup viewGroup = (ViewGroup) view;
        for (int i = 0; i < viewGroup.getChildCount(); i++) {
          child = viewGroup.getChildAt(i);
          visibility.add(child.getVisibility());
          child.setVisibility(View.INVISIBLE);
        }
        view.draw(canvas);
        for (int i = 0; i < viewGroup.getChildCount(); i++) {
          child = viewGroup.getChildAt(i);
          child.setVisibility(visibility.get(i));
        }
      } else {
        view.draw(canvas);
      }
    }

    private static Drawable createBareDrawable(Resources res, View view) {
      Rect src = new Rect();
      view.getDrawingRect(src);
      Bitmap bitmap = Bitmap.createBitmap(src.width(), src.height(), Bitmap.Config.ARGB_8888);
      Canvas canvas = new Canvas(bitmap);
      drawBareView(canvas, view);
      return new BitmapDrawable(res, bitmap);
    }

    private static ReactDrawableGroup traverse(Resources res, View view, boolean isRoot) {
      HashMap<View, ReactDrawableGroup> drawables = new HashMap<>();
      if (view instanceof ViewGroup) {
        ViewGroup viewGroup = (ViewGroup) view;
        View child;
        for (int i = 0; i < viewGroup.getChildCount(); i++) {
          child = viewGroup.getChildAt(i);
          drawables.put(child, traverse(res, viewGroup.getChildAt(i), false));
        }
      }
      return obtain(view, createBareDrawable(res, view), drawables, isRoot);
    }

    private static ReactDrawableGroup traverse(Resources res, View view, Rect bounds) {
      ReactDrawableGroup drawableGroup = traverse(res, view, true);
      drawableGroup.setBounds(bounds);
      return drawableGroup;
    }
  }

}
