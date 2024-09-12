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
#endif

        };

    }
}
