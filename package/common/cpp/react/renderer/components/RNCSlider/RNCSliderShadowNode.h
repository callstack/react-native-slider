#pragma once

#include <algorithm>
#include <jsi/jsi.h>
#include <react/renderer/components/RNCSlider/RNCSliderState.h>
#include <react/renderer/components/RNCSlider/Props.h>
#include <react/renderer/components/RNCSlider/EventEmitters.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/core/LayoutContext.h>
#include "RNCSliderMeasurementsManager.h"

namespace facebook {
    namespace react {

        JSI_EXPORT extern const char RNCSliderComponentName[];

/*
 * `ShadowNode` for <RNCSlider> component.
 */
        class JSI_EXPORT RNCSliderShadowNode final
                : public ConcreteViewShadowNode<
                        RNCSliderComponentName,
                        RNCSliderProps,
                        RNCSliderEventEmitter,
                        RNCSliderState> {
        public:
            using ConcreteViewShadowNode::ConcreteViewShadowNode;

            /*
             * The size this slider takes, given the size measured for a horizontal one.
             * A vertical slider is the same control turned a quarter turn,
             * so it stands as tall as a horizontal one is wide and as wide as one is tall,
             * which is why neither platform measures it a second time.
             */
            Size sizeForOrientation(Size horizontalSize) const {
                if (getConcreteProps().orientation != RNCSliderOrientation::Vertical) {
                    return horizontalSize;
                }

                return {horizontalSize.height, horizontalSize.width};
            }

            /*
             * Whether the slider draws step markers of its own, which it does for a
             * slider that has steps, unless JS replaced the markers.
             */
            bool drawsStepMarkers() const {
                const auto &props = getConcreteProps();

                return props.stepMarkers == RNCSliderStepMarkers::Native &&
                        props.step > 0 &&
                        props.maximumValue > props.minimumValue;
            }

            /*
             * The size a horizontal slider of the given size takes for the step
             * markers it draws to fit inside it: at least the given thickness
             * across, which each platform works out from its own thumb.
             *
             * The track stays in the middle of the slider, so a slider grown to
             * fit the markers below it grows above it just as much. A slider
             * whose style gives it a size of its own is never asked to measure
             * itself, so a height JS gives it still wins.
             */
            Size sizeForStepMarkers(Size horizontalSize, Float stepMarkedThickness) const {
                if (!drawsStepMarkers()) {
                    return horizontalSize;
                }

                return {horizontalSize.width, std::max(horizontalSize.height, stepMarkedThickness)};
            }

            /*
             * A slider is a leaf that knows its own size, so Yoga has to be told to ask for it.
             * Being a leaf also keeps its children, the custom thumbs,
             * out of Yoga altogether, which Yoga insists on for a node that measures itself:
             * they are laid out by `layout` below instead.
             */
            static ShadowNodeTraits BaseTraits() {
                auto traits = ConcreteViewShadowNode::BaseTraits();
                traits.set(ShadowNodeTraits::Trait::LeafYogaNode);
                traits.set(ShadowNodeTraits::Trait::MeasurableYogaNode);
                return traits;
            }

#pragma mark - LayoutableShadowNode

            /*
             * The children of a slider are the custom track, thumbs and step
             * markers JS renders in place of the built-in ones - in that order,
             * each of them only when JS replaced it. A slider is a leaf to Yoga,
             * so they take no part in laying it out, and are laid out here
             * instead: each thumb and step marker at the size it asks for, and
             * the track along the whole slider.
             *
             * The track and the thumbs are centred on the slider's origin, and
             * the native slider moves that centre onto its thumb, which is the
             * one thing JS cannot know the position of, or onto the middle of
             * the slider for the track. A step marker hangs from the origin
             * instead, which the native slider moves to just past the thumbs,
             * below the step - see `hungFromOrigin`.
             */
            void layout(LayoutContext layoutContext) override;

        private:
            /*
             * Lays out the host JS wraps the custom track in, stretching every
             * view of the track along the slider - see `layout`.
             */
            std::shared_ptr<const ShadowNode> layoutTrack(
                    const ShadowNode &trackHost,
                    LayoutContext layoutContext) const;

            static Point centredOnOrigin(Size size, LayoutContext layoutContext);

            /*
             * Where a step marker of the given size goes for the origin to sit
             * in the middle of its top edge - or of its left edge on a vertical
             * slider, which has its step markers to the right of the track
             * rather than below it, still the right way up.
             */
            static Point hungFromOrigin(Size size, bool vertical, LayoutContext layoutContext);

        public:
#ifdef ANDROID
            void setSliderMeasurementsManager(
                    const std::shared_ptr<RNCSliderMeasurementsManager> &measurementsManager);

#pragma mark - LayoutableShadowNode

            Size measureContent(
                    const LayoutContext &layoutContext,
                    const LayoutConstraints &layoutConstraints) const override;

        private:
            std::shared_ptr<RNCSliderMeasurementsManager> measurementsManager_;
#else
#pragma mark - LayoutableShadowNode

            /*
             * Implemented in `ios/RNCSliderShadowNode.mm` - the answer comes from
             * SwiftUI, which C++ cannot ask on its own.
             */
            Size measureContent(
                    const LayoutContext &layoutContext,
                    const LayoutConstraints &layoutConstraints) const override;
#endif

        };

    }
}
