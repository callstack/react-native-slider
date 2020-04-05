package com.reactnativecommunity.slider.drawables;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

public class ReactDrawableGroup extends ReactDrawable {

  private HashMap<View, Drawable> mDrawables;
  private View mID;

  private ReactDrawableGroup(View id, HashMap<View, Drawable> map, Drawable[] drawables) {
    super(drawables);
    mID =id;
    mDrawables = map;
  }

  @Override
  protected void onBoundsChange(Rect bounds) {
    /*
    View view = mDrawables.get;
    Rect src = new Rect();
    view.getDrawingRect(src);
    PointF scale = new PointF(bounds.width() / src.width(),bounds.height() / src.height());

     */
    traverseLayout(mID, null, new PointF(1,1));
    //super.onBoundsChange(bounds);
  }

  @Override
  public void draw(@NonNull Canvas canvas) {
    canvas.save();
    onPreDraw(canvas);
    mDrawables.get(mID).draw(canvas);
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

  private Rect scaleBounds(View view, PointF scale) {
    Rect bounds = new Rect();
    view.getDrawingRect(bounds);
    return scaleBounds(bounds, scale);
  }

  private Rect scaleBounds(Rect rawBounds, PointF scale) {
    RectF rectF = new RectF(0, 0, rawBounds.width() * scale.x, rawBounds.height() * scale.y);
    rectF.offset(rawBounds.width() * 0.5f * (1 - scale.x), rawBounds.height() * 0.5f * (1 - scale.y));
    rectF.offset(rawBounds.left * scale.x, rawBounds.top * scale.y);
    Rect out = new Rect();
    rectF.round(out);
    return out;
  }

  private void traverseLayout(View view, ViewGroup parent, PointF scale) {
    Drawable drawable = mDrawables.get(view);
    if (drawable == null) return;
    //Rect bounds = scaleBounds(view, scale);
    Rect out = new Rect();
    view.getDrawingRect(out);
    if (parent != null) {
      parent.offsetDescendantRectToMyCoords(view, out);
    }
    Log.d("Sliderr", "traverseLayout: " + out);
    //bounds.offset(parentBounds.left, parentBounds.top);
    drawable.setBounds(out);
    if (view instanceof ViewGroup) {
      ViewGroup viewGroup = ((ViewGroup) view);
      for (int i = 0; i < viewGroup.getChildCount(); i++) {
        traverseLayout(viewGroup.getChildAt(i), viewGroup, scale);
      }
    }
  }

  private static ReactDrawableGroup obtain(View id, HashMap<View, Drawable> drawables) {
    Set<Map.Entry<View, Drawable>> entries = drawables.entrySet();
    Iterator<Map.Entry<View, Drawable>> iterator = entries.iterator();
    Drawable[] out = new Drawable[entries.size()];
    int i = 0;
    while (iterator.hasNext()) {
      out[i++] = iterator.next().getValue();
    }
    return new ReactDrawableGroup(id, drawables, out);
  }

  private static void drawBareView(Canvas canvas, View view) {
    if (view.getParent() != null) {
      Rect r = new Rect();
      view.getDrawingRect(r);
      ((ViewGroup) view.getParent()).offsetDescendantRectToMyCoords(view, r);
      Log.d("Sliderr", "drawBareView: "+r);
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

  private static ReactDrawableGroup traverse(Resources res, View view) {
    HashMap<View, Drawable> drawables = new HashMap<>();
    Rect out = new Rect();
    Rect src = new Rect();
   // bounds.round(out);
    view.getDrawingRect(src);
    Bitmap bitmap = Bitmap.createBitmap(src.width(), src.height(), Bitmap.Config.ARGB_8888);
    Canvas canvas = new Canvas(bitmap);
    //PointF scale = new PointF(bounds.width() / src.width(),bounds.height() / src.height());
    //canvas.scale(scale.x, scale.y);
    //canvas.translate(bounds.left, bounds.top);
    //canvas.translate(view.getPaddingLeft(), view.getPaddingTop());
    drawBareView(canvas, view);
    drawables.put(view, new ReactDrawable(res, bitmap));
    if (view instanceof ViewGroup) {
      ViewGroup viewGroup = (ViewGroup) view;
      View child;
      for (int i = 0; i < viewGroup.getChildCount(); i++) {
        child = viewGroup.getChildAt(i);
        drawables.put(child, traverse(res, viewGroup.getChildAt(i)));
      }
    }
    ReactDrawableGroup drawableGroup = obtain(view, drawables);
    //drawableGroup.setBounds(out);
    return drawableGroup;
  }

  static ReactDrawableGroup traverse(Resources res, View view, Rect bounds) {
    ReactDrawableGroup drawableGroup = traverse(res, view);
    drawableGroup.setBounds(bounds);
    return drawableGroup;
  }
}
