package com.reactnativecommunity.slider.drawables;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.SparseArray;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ReactStylesDiffMap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class ReactDrawableGroup extends ReactDrawable {

  static ReactDrawableGroup obtain(DrawableHandler handler) {
    return new Builder(handler).get(true);
  }

  static class ReactRootDrawableGroup extends ReactDrawableGroup implements PropsUpdater {

    private final SparseArray<ReactDrawableGroup> mRegistry;

    ReactRootDrawableGroup(Builder builder) {
      super(builder);
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

  ReactDrawableGroup(Builder builder) {
    super(builder.getLayers(), builder.view);
    mID = builder.view;
    mBaseDrawable = builder.bare;
    mDrawables = builder.children;
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
    drawBackground(canvas);
    drawChildren(canvas);
    canvas.restore();
  }

  void drawBackground(Canvas canvas) {
    mBaseDrawable.draw(canvas);
  }

  void drawChildren(Canvas canvas) {
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
  }

  static class Builder {

    View view;
    Drawable bare;
    HashMap<View, ReactDrawableGroup> children;

    Builder(DrawableHandler handler) {
      this(handler.getResources(), handler.getView());
    }

    Builder(Resources res, View view) {
      this.view = view;
      bare = createBareDrawable(res, view);
      children = traverseChildren(res, view);
    }

    Drawable[] getLayers() {
      return toLayers(bare, children);
    }

    private ReactDrawableGroup get(boolean isRoot) {
      if (isRoot) {
        return new ReactRootDrawableGroup(this);
      } else {
        return new ReactDrawableGroup(this);
      }
    }

    private static HashMap<View, ReactDrawableGroup> traverseChildren(Resources res, View view) {
      HashMap<View, ReactDrawableGroup> drawables = new HashMap<>();
      if (view instanceof ViewGroup) {
        ViewGroup viewGroup = (ViewGroup) view;
        View child;
        for (int i = 0; i < viewGroup.getChildCount(); i++) {
          child = viewGroup.getChildAt(i);
          drawables.put(child, new Builder(res, child).get(false));
        }
      }
      return drawables;
    }

    private static Drawable[] toLayers(Drawable bare, HashMap<View, ReactDrawableGroup> drawables) {
      Set<Map.Entry<View, ReactDrawableGroup>> entries = drawables.entrySet();
      Drawable[] out = new Drawable[entries.size() + 1];
      int i = 0;
      out[i++] = bare;
      for (Map.Entry<View, ReactDrawableGroup> next : drawables.entrySet()) {
        out[i++] = next.getValue();
      }
      return out;
    }

    private static Drawable createBareDrawable(Resources res, View view) {
      Rect src = new Rect();
      view.getDrawingRect(src);
      Bitmap bitmap = Bitmap.createBitmap(src.width(), src.height(), Bitmap.Config.ARGB_8888);
      Canvas canvas = new Canvas(bitmap);
      drawBareView(canvas, view);
      return new BitmapDrawable(res, bitmap);
    }

    private static void drawBareView(Canvas canvas, View view) {
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

  }

}
