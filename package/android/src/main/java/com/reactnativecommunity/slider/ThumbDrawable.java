package com.reactnativecommunity.slider;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.drawee.drawable.ForwardingDrawable;

import java.util.Objects;


public class ThumbDrawable extends ForwardingDrawable {
    private final Paint mPaint = new Paint();
    private int width = 0;
    private int height = 0;
    private float rx = 100;
    private float ry = 100;

    /**
     * Constructs a new forwarding drawable.
     *
     * @param drawable drawable that this forwarding drawable will forward to
     */
    public ThumbDrawable(@Nullable Drawable drawable) {
        super(drawable);
        mPaint.setColor(Color.RED);
    }

    @Override
    public void draw(@NonNull Canvas canvas) {
        if (width == 0 || height == 0) {
            super.draw(canvas);
            return;
        }
        Rect defaultRect = Objects.requireNonNull(getDrawable()).getBounds();
        // LEFT, TOP, RIGHT, BOTTOM. so its actually at (left+(Right - left) / 2, top+(bottom - top) / 2)
        // with width = right - left and height = bottom - top
        float newLeft = defaultRect.left + (defaultRect.right - defaultRect.left) / 2f - width / 2f;
        float newTop = defaultRect.top + (defaultRect.bottom - defaultRect.top) / 2f - height / 2f;

        canvas.drawRoundRect(
                newLeft,
                newTop,
                newLeft + width,
                newTop + height,
                rx, ry, mPaint);
    }

    @Override
    public void setColorFilter(@Nullable ColorFilter colorFilter) {
        mPaint.setColorFilter(colorFilter);
        super.setColorFilter(colorFilter);
    }

    @Override
    public void clearColorFilter() {
        mPaint.setColorFilter(null);
        super.clearColorFilter();
    }

    public void setDimension(double width, double height) {
        this.width = (int) width;
        this.height = (int) height;
    }

    public void setCornerRoundness(double rx, double ry) {
        this.rx = (float) rx;
        this.ry = (float) ry;
    }
}
