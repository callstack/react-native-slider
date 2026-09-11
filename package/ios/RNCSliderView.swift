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
  @Published var ranged: Bool = false
  @Published var valueLeft: Double = 0
  @Published var valueRight: Double = 1

  /// Granularity of the values the slider reports: every one of them is a
  /// multiple of this. Zero means no granularity.
  @Published var step: Double = 0

  /// While the user drags, the thumb position is owned by this view. Value
  /// updates coming from JS in the meantime would fight the gesture, so they are
  /// ignored - the slider is uncontrolled for the duration of the drag.
  var isSliding = false

  /// The value a ranged thumb had when the drag in progress began, or `nil` when
  /// that thumb is not being dragged - which is also how the ranged slider knows
  /// to ignore values pushed from JS, the way `isSliding` does for the single
  /// thumb.
  ///
  /// A drag is tracked by how far it has travelled rather than by where the
  /// finger is, so grabbing a thumb off-centre does not snap it under the finger.
  var leftDragOrigin: Double?
  var rightDragOrigin: Double?

  /// Invoked continuously while the user drags the thumb.
  var onValueChange: ((Double) -> Void)?

  /// Invoked continuously while the user drags the respective thumb of a ranged
  /// slider.
  var onLeftValueChange: ((Double) -> Void)?
  var onRightValueChange: ((Double) -> Void)?

  /// SwiftUI traps on an empty or descending range. Props arrive one at a time,
  /// so a momentarily inverted range is expected rather than exceptional.
  var range: ClosedRange<Double> {
    maximumValue > minimumValue ? minimumValue...maximumValue : minimumValue...(minimumValue + 1)
  }
}

struct RNCSliderContent: View {
  @ObservedObject var model: RNCSliderModel

  var body: some View {
    RNCRangedSliderContent(model: model)
  }
}

struct RNCSingleSliderContent: View {
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

/// SwiftUI has no two-thumb slider, so this one is drawn here: a track, the
/// selected span, and a thumb at each end of it. The shape follows `Slider` -
/// a capsule track with the selected part tinted, and a white circular thumb -
/// so that a ranged slider does not look foreign next to a plain one.
struct RNCRangedSliderContent: View {
  @ObservedObject var model: RNCSliderModel

  /// Which end of the range a thumb drags.
  private enum Thumb {
    case single
    case left
    case right
  }

  var body: some View {
    GeometryReader { geometry in
      let range = model.range
      // A thumb is never taller than the slider itself: JS decides the height,
      // and a thumb spilling out of it would draw over its neighbours.
      let diameter = min(Self.thumbDiameter, geometry.size.height)
      // The span the centre of a thumb moves across. Both thumbs stay fully
      // inside the view, so it is short of the width by one thumb.
      let travel = max(geometry.size.width - (model.ranged ? diameter : 0), 0)

      let leftOffset = offset(of: model.ranged ? model.valueLeft : model.value, in: range, travel: travel)
      let rightOffset = offset(of: model.valueRight, in: range, travel: travel)

      let trackFillWidth = model.ranged ? max(rightOffset - leftOffset, 0) : leftOffset
      let trackFillStartPoint = model.ranged ? min(leftOffset, rightOffset) + diameter / 2 : 0

      ZStack(alignment: .leading) {
        Capsule()
          .fill(Self.trackColor)
          .frame(height: Self.trackHeight)

        // Drawn between the two thumb centres, which is why it is inset by half
        // a thumb. `max` keeps it from inverting on values crossed by JS.
        Capsule()
          .fill(Color.accentColor)
          .frame(width: trackFillWidth, height: Self.trackHeight)
          .offset(x: trackFillStartPoint)

        if model.ranged {
          thumb(.right, diameter: diameter, offset: rightOffset, range: range, travel: travel)
          thumb(.left, diameter: diameter, offset: leftOffset, range: range, travel: travel)
            .zIndex(model.valueLeft >= range.upperBound ? 1 : 0)
        } else {
          thumb(.single, diameter: diameter, offset: leftOffset, range: range, travel: travel)
        }
      }
      .frame(width: geometry.size.width, height: geometry.size.height)
    }
  }

  private func thumb(
    _ thumb: Thumb,
    diameter: CGFloat,
    offset: CGFloat,
    range: ClosedRange<Double>,
    travel: CGFloat
  ) -> some View {
    Circle()
      .fill(Color.white)
      .shadow(color: .black.opacity(0.25), radius: 2, y: 1)
      .frame(width: diameter, height: diameter)
      // A thumb is a small thing to grab, and the two of them can end up right
      // next to each other, so the area that answers to a touch is padded out
      // to the 44pt Apple asks for. The padding is then shifted back off the
      // offset, leaving the circle itself where the value puts it.
      .padding(Self.thumbTouchSlop)
      .contentShape(Rectangle())
      .offset(x: offset - Self.thumbTouchSlop)
      .gesture(
        DragGesture(minimumDistance: 0)
          .onChanged { gesture in
            let origin = dragOrigin(of: thumb) ?? value(of: thumb)
            setDragOrigin(origin, of: thumb)

            let travelled = travel > 0
              ? Double(gesture.translation.width / travel) * span(of: range)
              : 0
            set(origin + travelled, of: thumb, in: range)
          }
          .onEnded { _ in setDragOrigin(nil, of: thumb) }
      )
      // Drawn rather than built from a UIKit control, so VoiceOver has to be
      // told what this is by hand. An adjustment moves the thumb by one step,
      // or by 10% of the range when the slider has none - which is what
      // `UISlider` does.
      .accessibilityElement()
      .accessibilityValue(Text(percentage(of: value(of: thumb), in: range)))
      .accessibilityAdjustableAction { direction in
        let step = model.step > 0 ? model.step : span(of: range) / 10
        switch direction {
        case .increment:
          set(value(of: thumb) + step, of: thumb, in: range)
        case .decrement:
          set(value(of: thumb) - step, of: thumb, in: range)
        @unknown default:
          break
        }
      }
  }

  // MARK: - Values

  private func value(of thumb: Thumb) -> Double {
    switch thumb {
    case .single: return model.value
    case .left: return model.valueLeft
    case .right: return model.valueRight
    }
  }

  /// Moves one thumb, keeping it inside the range and on its own side of the
  /// other thumb, and reports it to JS. The two thumbs cannot swap places.
  private func set(_ newValue: Double, of thumb: Thumb, in range: ClosedRange<Double>) {
    let stepped = snapped(newValue)

    switch thumb {
    case .single:
      let clamped = stepped.clamped(to: range)
      guard clamped != model.value else { return }
      model.value = clamped
      model.onValueChange?(clamped)
    case .left:
      let clamped = stepped.clamped(
        to: range.lowerBound...model.valueRight.clamped(to: range)
      )
      guard clamped != model.valueLeft else { return }
      model.valueLeft = clamped
      model.onLeftValueChange?(clamped)
    case .right:
      let clamped = stepped.clamped(
        to: model.valueLeft.clamped(to: range)...range.upperBound
      )
      guard clamped != model.valueRight else { return }
      model.valueRight = clamped
      model.onRightValueChange?(clamped)
    }
  }

  /// Rounds a value to the nearest multiple of the step, which is the
  /// granularity JS is promised. A step of zero leaves the value alone.
  ///
  /// Clamping is left to the caller: a snapped value can land outside the range
  /// or past the other thumb, and each thumb answers for that differently. The
  /// ends of the range stay reachable that way, whether or not the step divides
  /// the range evenly.
  private func snapped(_ value: Double) -> Double {
    let step = model.step
    guard step > 0 else { return value }

    // Multiplying the step back out misses the mark by a fraction whenever the
    // step is one that binary floating point cannot hold - three tenths
    // arriving as 0.30000000000000004 - so the product is rounded to the
    // decimals the step itself is written with, and reaches JS reading the way
    // the step was written.
    return ((value / step).rounded() * step).rounded(toDecimals: step.decimals)
  }

  private func dragOrigin(of thumb: Thumb) -> Double? {
    switch thumb {
    case .single: return model.leftDragOrigin
    case .left: return model.leftDragOrigin
    case .right: return model.rightDragOrigin
    }
  }

  private func setDragOrigin(_ origin: Double?, of thumb: Thumb) {
    switch thumb {
    case .single: model.leftDragOrigin = origin
    case .left: model.leftDragOrigin = origin
    case .right: model.rightDragOrigin = origin
    }
  }

  // MARK: - Geometry

  private func span(of range: ClosedRange<Double>) -> Double {
    range.upperBound - range.lowerBound
  }

  /// Distance from the leading edge of the view to the leading edge of a thumb
  /// sitting at `value`.
  private func offset(
    of value: Double,
    in range: ClosedRange<Double>,
    travel: CGFloat
  ) -> CGFloat {
    CGFloat(fraction(of: value, in: range)) * travel
  }

  private func fraction(of value: Double, in range: ClosedRange<Double>) -> Double {
    let span = span(of: range)
    guard span > 0 else { return 0 }

    return ((value - range.lowerBound) / span).clamped(to: 0...1)
  }

  private func percentage(of value: Double, in range: ClosedRange<Double>) -> String {
    NumberFormatter.localizedString(
      from: NSNumber(value: fraction(of: value, in: range)),
      number: .percent
    )
  }

  /// Matches the thumb `UISlider` draws.
  private static let thumbDiameter: CGFloat = 28

  /// Grown around the thumb on every side, to reach 44pt across.
  private static let thumbTouchSlop: CGFloat = 8

  private static let trackHeight: CGFloat = 4

  /// What `Slider` leaves the unselected part of its track looking like.
  private static let trackColor = Color(uiColor: .systemFill)
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

  /// Whether the slider selects a span of the range with two thumbs, rather
  /// than a single value with one. `value` and `valueLeft`/`valueRight` belong
  /// to the two shapes respectively, and the unused pair is simply not drawn.
  @objc public var ranged: Bool {
    get { model.ranged }
    set { model.ranged = newValue }
  }

  /// Setting either of these while the matching thumb is being dragged is a
  /// no-op - see `RNCSliderModel.leftDragOrigin`.
  @objc public var valueLeft: Double {
    get { model.valueLeft }
    set {
      guard model.leftDragOrigin == nil else { return }
      model.valueLeft = newValue
    }
  }

  @objc public var valueRight: Double {
    get { model.valueRight }
    set {
      guard model.rightDragOrigin == nil else { return }
      model.valueRight = newValue
    }
  }

  /// Granularity of the values the slider reports - see
  /// `RNCSliderModel.step`. A value pushed from JS is taken as it comes, so
  /// only the values the slider arrives at itself are snapped.
  @objc public var step: Double {
    get { model.step }
    set { model.step = newValue }
  }

  @objc public var onValueChange: ((Double) -> Void)? {
    get { model.onValueChange }
    set { model.onValueChange = newValue }
  }

  @objc public var onLeftValueChange: ((Double) -> Void)? {
    get { model.onLeftValueChange }
    set { model.onLeftValueChange = newValue }
  }

  @objc public var onRightValueChange: ((Double) -> Void)? {
    get { model.onRightValueChange }
    set { model.onRightValueChange = newValue }
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
  /// A ranged slider is deliberately measured the same way, from the single
  /// thumb: it is laid out inside whatever height it is given, and taking the
  /// platform's own slider height keeps the two the same size.
  ///
  /// Must be called on the main thread.
  @objc public static func measuredIntrinsicSize() -> CGSize {
    let controller = UIHostingController(rootView: RNCSingleSliderContent(model: RNCSliderModel()))
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
    model.leftDragOrigin = nil
    model.rightDragOrigin = nil
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

  /// How many decimals it takes to write this value out, capped at the digits a
  /// `Double` can be trusted with.
  var decimals: Int {
    var decimals = 0
    var scaled = magnitude

    while decimals < Self.maximumDecimals, scaled != scaled.rounded(.down) {
      scaled *= 10
      decimals += 1
    }

    return decimals
  }

  func rounded(toDecimals decimals: Int) -> Double {
    let scale = pow(10, Double(decimals))

    return (self * scale).rounded() / scale
  }

  private static let maximumDecimals = 15
}
