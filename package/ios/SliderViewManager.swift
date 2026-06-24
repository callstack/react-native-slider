import UIKit

@objc(SliderViewManager)
class SliderViewManager: RCTViewManager {

  override func view() -> UIView! {
    return SliderView()
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
