#include "RNCSliderShadowNode.h"
#include "RNCSliderMeasurementsManager.h"

namespace facebook {
    namespace react {

        extern const char RNCSliderComponentName[] = "RNCSlider";

#ifdef ANDROID
        void RNCSliderShadowNode::setSliderMeasurementsManager(
                const std::shared_ptr<RNCSliderMeasurementsManager> &
                measurementsManager) {
            ensureUnsealed();
            measurementsManager_ = measurementsManager;
        }

#pragma mark - LayoutableShadowNode

        Size RNCSliderShadowNode::measureContent(
                const LayoutContext & /*layoutContext*/,
                const LayoutConstraints &layoutConstraints) const {
            return measurementsManager_->measure(getSurfaceId(), layoutConstraints);
        }
#endif

    }
}
