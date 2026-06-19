#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(SliderViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(minValue, double)
RCT_EXPORT_VIEW_PROPERTY(maxValue, double)
RCT_EXPORT_VIEW_PROPERTY(step, double)
RCT_EXPORT_VIEW_PROPERTY(onValueChange, RCTDirectEventBlock)

@end
