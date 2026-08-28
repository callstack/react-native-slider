import SwiftUI
import UIKit

/// Every prop coming from JS is kept here rather than on the SwiftUI view, so a
/// prop update re-renders just the slider instead of rebuilding the hosted
/// hierarchy.
///
/// The initial values only stand until the component view pushes the real props,
/// which it does as soon as it creates the view.
final class RNCSliderModel: ObservableObject {
  @Published var minimumValue: Double = 0
  @Published var maximumValue: Double = 1
  @Published var value: Double = 0

  /// While the user drags, the thumb position is owned by this view. Value
  /// updates coming from JS in the meantime would fight the gesture, so they are
  /// ignored - the slider is uncontrolled for the duration of the drag.
  var isSliding = false

  /// Invoked continuously while the user drags the thumb.
  var onValueChange: ((Double) -> Void)?

  /// SwiftUI traps on an empty or descending range. Props arrive one at a time,
  /// so a momentarily inverted range is expected rather than exceptional.
  var range: ClosedRange<Double> {
    maximumValue > minimumValue ? minimumValue...maximumValue : minimumValue...(minimumValue + 1)
  }
}

struct RNCSliderContent: View {
  @ObservedObject var model: RNCSliderModel

  var body: some View {
    let range = model.range

    Slider(
      value: Binding(
        get: { model.value.clamped(to: range) },
        set: { newValue in
          model.value = newValue
          model.onValueChange?(newValue)
        }
      ),
      in: range,
      onEditingChanged: { isEditing in model.isSliding = isEditing }
    )
  }
}

/// Hosts the SwiftUI slider inside the UIKit view hierarchy Fabric mounts.
///
/// The hosting controller is parented to the closest view controller once this
/// view reaches a window: SwiftUI needs a controller in the hierarchy for
/// environment propagation, and Fabric hands us a plain view with no controller
/// of its own.
@objc(RNCSliderView)
public final class RNCSliderView: UIView {

  private let model: RNCSliderModel
  private let hostingController: UIHostingController<RNCSliderContent>

  @objc public var minimumValue: Double {
    get { model.minimumValue }
    set { model.minimumValue = newValue }
  }

  @objc public var maximumValue: Double {
    get { model.maximumValue }
    set { model.maximumValue = newValue }
  }

  /// Setting this while the user is dragging is a no-op - see
  /// `RNCSliderModel.isSliding`.
  @objc public var value: Double {
    get { model.value }
    set {
      guard !model.isSliding else { return }
      model.value = newValue
    }
  }

  @objc public var onValueChange: ((Double) -> Void)? {
    get { model.onValueChange }
    set { model.onValueChange = newValue }
  }

  public override init(frame: CGRect) {
    let model = RNCSliderModel()
    self.model = model
    hostingController = UIHostingController(rootView: RNCSliderContent(model: model))

    super.init(frame: frame)

    hostingController.view.backgroundColor = .clear
    hostingController.view.frame = bounds
    if #available(iOS 16.4, visionOS 1.0, *) {
      // Fabric already positions this view inside the safe area; letting the
      // hosting controller inset the slider a second time would shift it.
      hostingController.safeAreaRegions = []
    }
    addSubview(hostingController.view)
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  /// The size a slider takes when JS gives it none.
  ///
  /// The height is whatever SwiftUI asks for, so it tracks the platform instead
  /// of a number written down here. The width is only a hint - a SwiftUI
  /// `Slider` has no width of its own to report, and flexbox is what actually
  /// stretches it.
  ///
  /// Must be called on the main thread.
  @objc public static func measuredIntrinsicSize() -> CGSize {
    let controller = UIHostingController(rootView: RNCSliderContent(model: RNCSliderModel()))
    let fitted = controller.sizeThatFits(
      in: CGSize(width: intrinsicWidth, height: .greatestFiniteMagnitude)
    )

    // An unbounded proposal is meant to come back as the ideal height, but a
    // slider laid out to an infinite height would disappear rather than look
    // wrong, so don't take SwiftUI's word for it unconditionally.
    let height = fitted.height.isFinite && fitted.height > 0 ? fitted.height : fallbackHeight

    return CGSize(width: intrinsicWidth, height: height)
  }

  private static let intrinsicWidth: CGFloat = 200

  /// The smallest control Apple's guidelines will accept as a touch target.
  private static let fallbackHeight: CGFloat = 44

  /// Drops any drag in progress, so that a value pushed straight after is not
  /// swallowed by the rule above. Fabric recycles component views, and one
  /// retired mid-drag would otherwise stay deaf to updates for good.
  @objc public func cancelSliding() {
    model.isSliding = false
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    hostingController.view.frame = bounds
  }

  public override func didMoveToWindow() {
    super.didMoveToWindow()

    if window == nil {
      detachFromParentViewController()
    } else {
      attachToParentViewController()
    }
  }

  private func attachToParentViewController() {
    guard hostingController.parent == nil,
          let parent = closestViewController() else {
      return
    }

    // The hosted view is already a subview, so only the controller containment
    // half of the usual dance is left to do.
    parent.addChild(hostingController)
    hostingController.didMove(toParent: parent)
  }

  private func detachFromParentViewController() {
    guard hostingController.parent != nil else { return }

    hostingController.willMove(toParent: nil)
    hostingController.removeFromParent()
  }

  private func closestViewController() -> UIViewController? {
    var responder: UIResponder? = next

    while let current = responder {
      if let viewController = current as? UIViewController {
        return viewController
      }
      responder = current.next
    }

    return nil
  }
}

private extension Double {
  func clamped(to range: ClosedRange<Double>) -> Double {
    min(max(self, range.lowerBound), range.upperBound)
  }
}
