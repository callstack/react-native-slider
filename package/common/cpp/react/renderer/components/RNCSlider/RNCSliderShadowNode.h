#pragma once

#include <jsi/jsi.h>
#include <react/renderer/components/rncore/EventEmitters.h>
#include <react/renderer/components/RNCSlider/RNCSliderState.h>
#include <react/renderer/components/RNCSlider/Props.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>

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
        ViewEventEmitter,
        RNCSliderState> {
        using ConcreteViewShadowNode::ConcreteViewShadowNode;
    };

} // namespace react
} // namespace facebook
