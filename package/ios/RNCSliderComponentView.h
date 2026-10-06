#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Fabric component view for <RNCSlider>. It owns no drawing of its own: the
 * slider itself is the SwiftUI view hosted by `RNCSliderView`, and this class
 * only translates props and events between it and the renderer - and hands it
 * the custom track and thumbs JS renders as the slider's children.
 */
@interface RNCSliderComponentView : RCTViewComponentView

@end

NS_ASSUME_NONNULL_END
