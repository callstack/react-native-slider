#include "RNCSliderShadowNode.h"
#include "RNCSliderMeasurementsManager.h"
#include <cmath>
#include <limits>
#include <react/renderer/core/LayoutConstraints.h>
#include <react/renderer/graphics/rounding.h>

namespace facebook {
    namespace react {
        extern const char RNCSliderComponentName[] = "RNCSlider";

#pragma mark - LayoutableShadowNode

        void RNCSliderShadowNode::layout(LayoutContext layoutContext) {
            ensureUnsealed();

            if (getChildren().empty()) {
                return;
            }

            // A thumb is as big as it makes itself: the slider has no say in it,
            // and a thumb bigger than the slider simply spills out of it.
            auto thumbConstraints = LayoutConstraints{
                    .minimumSize = {0, 0},
                    .maximumSize = {
                            std::numeric_limits<Float>::infinity(),
                            std::numeric_limits<Float>::infinity()},
                    .layoutDirection = getLayoutMetrics().layoutDirection};

            // The children are shared with the tree this slider was cloned from,
            // so each one is cloned before being laid out - the way
            // `ParagraphShadowNode` lays out the views inlined in its text.
            auto thumbs = std::make_shared<std::vector<std::shared_ptr<const ShadowNode>>>();
            thumbs->reserve(getChildren().size());

            for (const auto &child : getChildren()) {
                auto thumb = child->clone({});

                if (auto layoutableThumb = dynamic_cast<LayoutableShadowNode *>(thumb.get())) {
                    layoutableThumb->layoutTree(layoutContext, thumbConstraints);

                    // Centred on the slider's origin rather than placed at the thumb:
                    // the thumb moves with every drag, which the native view follows without asking JS for a new layout.
                    auto thumbMetrics = layoutableThumb->getLayoutMetrics();
                    thumbMetrics.frame.origin = roundToPixel<&std::round>(
                            Point{
                                    -thumbMetrics.frame.size.width / 2,
                                    -thumbMetrics.frame.size.height / 2},
                            layoutContext.pointScaleFactor);
                    layoutableThumb->setLayoutMetrics(thumbMetrics);
                }

                thumbs->push_back(std::move(thumb));
            }

            children_ = std::move(thumbs);
        }

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
            return sizeForOrientation(
                    measurementsManager_->measure(getSurfaceId(), layoutConstraints));
        }
#endif

    }
}
