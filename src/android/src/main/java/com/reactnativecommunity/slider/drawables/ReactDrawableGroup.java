package com.reactnativecommunity.slider.drawables;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.RectF;
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

public class ReactDrawableGroup extends ReactDrawable {

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

    public void transformBounds(Rect bounds) {}

    @Override
    protected void onBoundsChange(Rect bounds) {
      Rect v = new Rect();
      mID.getDrawingRect(v);
      transformBounds(bounds);
      PointF scale = new PointF(bounds.width() * 1f / v.width(), bounds.height() * 1f / v.height());
      traverseLayout(mID, scale);
    }

    void traverseLayout(View view, PointF scale) {
      boolean firstTraversal = view == mID;
      Drawable drawable = mRegistry.get(view.getId());
      if (drawable == null) return;

      Rect out = new Rect();
      view.getDrawingRect(out);
      RectF local = new RectF(0, 0, out.width() * scale.x, out.height() * scale.y);
      if (mID instanceof ViewGroup && !firstTraversal) {
        ((ViewGroup) mID).offsetDescendantRectToMyCoords(view, out);
      }
      local.offsetTo(out.left * scale.x, out.top * scale.y);
      local.round(out);

      if (firstTraversal) {
        super.onBoundsChange(out);
      } else {
        drawable.setBounds(out);
      }

      if (view instanceof ViewGroup) {
        ViewGroup viewGroup = ((ViewGroup) view);
        for (int i = 0; i < viewGroup.getChildCount(); i++) {
          traverseLayout(viewGroup.getChildAt(i), scale);
        }
      }
    }
  }

  private HashMap<View, ReactDrawableGroup> mDrawables;
  View mID;
  private Drawable mBaseDrawable;

  ReactDrawableGroup(Builder builder) {
    super(builder.getLayers(), builder.view);
    mID = builder.view;
    mBaseDrawable = builder.base;
    mDrawables = builder.children;
  }

  @Override
  protected void onBoundsChange(Rect bounds) {
    mBaseDrawable.setBounds(bounds);
  }

  @Override
  public void draw(@NonNull Canvas canvas) {
    canvas.save();
    onPreDraw(canvas);
    drawBackground(canvas);
    drawChildren(canvas);
    canvas.restore();
  }

  private void drawBackground(Canvas canvas) {
    canvas.save();
    mBaseDrawable.draw(canvas);
    canvas.restore();
  }

  private void drawChildren(Canvas canvas) {
    if (mID instanceof ViewGroup) {
      ViewGroup viewGroup = ((ViewGroup) mID);
      for (int i = 0; i < viewGroup.getChildCount(); i++) {
        canvas.save();
        mDrawables.get(viewGroup.getChildAt(i)).draw(canvas);
        canvas.restore();
      }
    }
  }

  static class Builder {

    View view;
    Drawable base;
    HashMap<View, ReactDrawableGroup> children;
    DrawableHandler handler;

    Builder(DrawableHandler handler) {
      this(handler.getResources(), handler.getView());
      this.handler = handler;
    }

    Builder(Resources res, View view) {
      this.view = view;
      base = createBaseDrawable(res, view);
      children = traverseChildren(res, view);
    }

    Drawable[] getLayers() {
      ArrayList<Drawable> layers = new ArrayList<>();
      layers.add(base);
      for (Map.Entry<View, ReactDrawableGroup> next : children.entrySet()) {
        layers.add(next.getValue());
      }
      return layers.toArray(new Drawable[0]);
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

    private static Drawable createBaseDrawable(Resources res, View view) {
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
