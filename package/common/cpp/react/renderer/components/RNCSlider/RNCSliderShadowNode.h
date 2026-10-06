#pragma once

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
             * The children of a slider are the custom track and thumbs JS
             * renders in place of the built-in ones - the track first, when
             * there is one. A slider is a leaf to Yoga, so they take no part in
             * laying it out, and are laid out here instead: each thumb at the
             * size it asks for, and the track along the whole slider, all of
             * them centred on the slider's origin. The native slider moves that
             * centre onto its thumb, which is the one thing JS cannot know the
             * position of, or onto the middle of the slider for the track.
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
