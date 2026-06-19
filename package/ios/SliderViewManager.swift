

@objc(SliderViewManager)
class SliderViewManager: RCTViewManager {
    
    override func view() -> (SliderView) {
        return SliderView()
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return false
    }
}


