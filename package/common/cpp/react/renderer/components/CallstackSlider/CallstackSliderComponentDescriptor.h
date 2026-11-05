#pragma once

#include <react/renderer/components/CallstackSlider/CallstackSliderShadowNode.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include "CallstackSliderMeasurementsManager.h"

namespace facebook {
    namespace react {

        class CallstackSliderComponentDescriptor final
                : public ConcreteComponentDescriptor<CallstackSliderShadowNode> {
#ifdef ANDROID
        public:
            CallstackSliderComponentDescriptor(const ComponentDescriptorParameters &parameters)
                    : ConcreteComponentDescriptor(parameters), measurementsManager_(
                    std::make_shared<CallstackSliderMeasurementsManager>(contextContainer_)) {}

            void adopt(ShadowNode &shadowNode) const override {
                ConcreteComponentDescriptor::adopt(shadowNode);


                auto &sliderShadowNode =
                        static_cast<CallstackSliderShadowNode &>(shadowNode);

                // `CallstackSliderShadowNode` uses `CallstackSliderMeasurementsManager` to provide measurements to Yoga.
                // It is a measured leaf by its own traits. see `CallstackSliderShadowNode::BaseTraits`.
                sliderShadowNode.setSliderMeasurementsManager(
                        measurementsManager_);
            }
        private:
            const std::shared_ptr<CallstackSliderMeasurementsManager> measurementsManager_;
#else
        public:
            CallstackSliderComponentDescriptor(const ComponentDescriptorParameters &parameters)
            : ConcreteComponentDescriptor(parameters) {}
#endif
        };

    }
}
