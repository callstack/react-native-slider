#include "RNCSliderShadowNode.h"
#include "RNCSliderMeasurementsManager.h"
#include <algorithm>
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

            const auto &props = getConcreteProps();

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
            auto children = std::make_shared<std::vector<std::shared_ptr<const ShadowNode>>>();
            children->reserve(getChildren().size());

            // The children come in a fixed order - the track, the thumbs, and
            // then the step markers - and the props say how many of the first
            // two there are.
            const auto trackCount = props.customTrack ? 1 : 0;
            const auto thumbCount = props.customThumb ? (props.ranged ? 2 : 1) : 0;
            const auto vertical = props.orientation == RNCSliderOrientation::Vertical;

            for (const auto &child : getChildren()) {
                const auto index = static_cast<int>(children->size());

                if (index < trackCount) {
                    children->push_back(layoutTrack(*child, layoutContext));
                    continue;
                }

                const auto isStepMarker = index >= trackCount + thumbCount &&
                        props.stepMarkers == RNCSliderStepMarkers::Custom;

                auto laidOutChild = child->clone({});

                if (auto layoutableChild = dynamic_cast<LayoutableShadowNode *>(laidOutChild.get())) {
                    // A step marker is as big as it makes itself, the way a thumb is.
                    layoutableChild->layoutTree(layoutContext, thumbConstraints);

                    // Placed against the slider's origin rather than where it shows:
                    // a thumb moves with every drag, and a step marker with the
                    // geometry of the native slider, and the native view follows
                    // both without asking JS for a new layout.
                    auto childMetrics = layoutableChild->getLayoutMetrics();
                    childMetrics.frame.origin = isStepMarker
                            ? hungFromOrigin(childMetrics.frame.size, vertical, layoutContext)
                            : centredOnOrigin(childMetrics.frame.size, layoutContext);
                    layoutableChild->setLayoutMetrics(childMetrics);
                }

                children->push_back(std::move(laidOutChild));
            }

            children_ = std::move(children);
        }

        std::shared_ptr<const ShadowNode> RNCSliderShadowNode::layoutTrack(
                const ShadowNode &trackHost,
                LayoutContext layoutContext) const {
            // A track lies along the slider, so it is as long as the slider is,
            // whichever way round that is: a vertical slider turns its track round
            // along with everything else.
            const auto sliderSize = getLayoutMetrics().frame.size;
            const auto length = getConcreteProps().orientation == RNCSliderOrientation::Vertical
                    ? sliderSize.height
                    : sliderSize.width;

            // The length is forced on each view the track renders, rather than on
            // the host JS wraps them in, so that a track sized by its own style is
            // stretched along the slider all the same. Across the slider it is as
            // thick as it makes itself.
            auto partConstraints = LayoutConstraints{
                    .minimumSize = {length, 0},
                    .maximumSize = {length, std::numeric_limits<Float>::infinity()},
                    .layoutDirection = getLayoutMetrics().layoutDirection};

            auto parts = std::make_shared<std::vector<std::shared_ptr<const ShadowNode>>>();
            parts->reserve(trackHost.getChildren().size());
            auto trackSize = Size{length, 0};

            for (const auto &part : trackHost.getChildren()) {
                auto laidOutPart = part->clone({});

                if (auto layoutablePart = dynamic_cast<LayoutableShadowNode *>(laidOutPart.get())) {
                    layoutablePart->layoutTree(layoutContext, partConstraints);

                    // A track rendering more than one view has them lie on top of
                    // each other, each one spanning the whole of it.
                    auto partMetrics = layoutablePart->getLayoutMetrics();
                    partMetrics.frame.origin = {0, 0};
                    layoutablePart->setLayoutMetrics(partMetrics);
                    trackSize.height = std::max(trackSize.height, partMetrics.frame.size.height);
                }

                parts->push_back(std::move(laidOutPart));
            }

            // The host is only there to keep the track in one piece, so it takes
            // the size of what it holds instead of being laid out by Yoga. It is
            // centred on the slider's origin the way a thumb is, and the native
            // view moves that centre onto the middle of the slider - turning it
            // round on a vertical one, which no frame can describe.
            auto track = trackHost.clone({.children = parts});

            if (auto layoutableTrack = dynamic_cast<LayoutableShadowNode *>(track.get())) {
                auto trackMetrics = layoutableTrack->getLayoutMetrics();
                trackMetrics.frame.size = trackSize;
                trackMetrics.frame.origin = centredOnOrigin(trackSize, layoutContext);
                trackMetrics.pointScaleFactor = layoutContext.pointScaleFactor;
                trackMetrics.layoutDirection = getLayoutMetrics().layoutDirection;
                layoutableTrack->setLayoutMetrics(trackMetrics);
            }

            return track;
        }

        Point RNCSliderShadowNode::centredOnOrigin(Size size, LayoutContext layoutContext) {
            return roundToPixel<&std::round>(
                    Point{-size.width / 2, -size.height / 2},
                    layoutContext.pointScaleFactor);
        }

        Point RNCSliderShadowNode::hungFromOrigin(Size size, bool vertical, LayoutContext layoutContext) {
            return roundToPixel<&std::round>(
                    vertical ? Point{0, -size.height / 2} : Point{-size.width / 2, 0},
                    layoutContext.pointScaleFactor);
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
            // The step-marked measurement is only the room the markers need, which
            // a slider measured any taller already has.
            auto horizontalSize = measurementsManager_->measure(getSurfaceId(), layoutConstraints, false);
            if (drawsStepMarkers()) {
                horizontalSize = sizeForStepMarkers(
                        horizontalSize,
                        measurementsManager_->measure(getSurfaceId(), layoutConstraints, true).height);
            }

            return sizeForOrientation(horizontalSize);
        }
#endif

    }
}
