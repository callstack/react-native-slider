#import "RCTViewManager.h"

@interface RCT_EXTERN_MODULE(SliderViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(minValue, double)
RCT_EXPORT_VIEW_PROPERTY(maxValue, double)
RCT_EXPORT_VIEW_PROPERTY(step, double)
RCT_EXPORT_VIEW_PROPERTY(value, double)
RCT_EXPORT_VIEW_PROPERTY(lowerLimit, double)
RCT_EXPORT_VIEW_PROPERTY(upperLimit, double)
RCT_EXPORT_VIEW_PROPERTY(disabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(inverted, BOOL)
RCT_EXPORT_VIEW_PROPERTY(tapToSeek, BOOL)
RCT_EXPORT_VIEW_PROPERTY(minimumTrackTintColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(maximumTrackTintColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(thumbTintColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(thumbImage, UIImage)
RCT_EXPORT_VIEW_PROPERTY(thumbSize, double)
RCT_EXPORT_VIEW_PROPERTY(trackImage, UIImage)
RCT_EXPORT_VIEW_PROPERTY(minimumTrackImage, UIImage)
RCT_EXPORT_VIEW_PROPERTY(maximumTrackImage, UIImage)
RCT_EXPORT_VIEW_PROPERTY(onValueChange, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onSlidingStart, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onSlidingComplete, RCTDirectEventBlock)

@end
