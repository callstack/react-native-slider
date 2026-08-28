#pragma once

#include <jsi/jsi.h>
#include <react/renderer/components/RNCSlider/RNCSliderState.h>
#include <react/renderer/components/RNCSlider/Props.h>
#include <react/renderer/components/RNCSlider/EventEmitters.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>

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
            /*
             * A slider is a leaf that knows its own size, so Yoga has to be told
             * to ask for it. Android arrives at the same two traits through
             * `enableMeasurement()` in the component descriptor, because it also
             * has a measurements manager to inject there.
             */
            static ShadowNodeTraits BaseTraits() {
                auto traits = ConcreteViewShadowNode::BaseTraits();
                traits.set(ShadowNodeTraits::Trait::LeafYogaNode);
                traits.set(ShadowNodeTraits::Trait::MeasurableYogaNode);
                return traits;
            }

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
