import Combine
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

  /// Bounds the thumbs can be dragged between. The track is drawn across the
  /// whole range regardless: a limit takes away the values a thumb can reach,
  /// not the ones the slider shows.
  @Published var lowerLimit: Double = 0
  @Published var upperLimit: Double = 1

  /// Whether the slider runs up the view rather than across it, with the
  /// minimum at the bottom and the maximum at the top.
  ///
  /// Only the geometry changes with it: the range, the step, the limits, the
  /// two thumbs and the events they report are the same either way round.
  @Published var vertical: Bool = false

  /// Tints of the three parts the thumbs cut the track into: below the thumb (or
  /// the left thumb), between the two thumbs of a ranged slider, and above the
  /// thumb (or the right thumb). `nil` leaves a part looking the way `Slider`
  /// draws it - see `RNCRangedSliderContent.trackSegments`.
  @Published var minimumTrackColor: UIColor?
  @Published var middleRangeTrackColor: UIColor?
  @Published var maximumTrackColor: UIColor?

  /// How many of the thumbs JS has replaced with views of its own, counted from
  /// the left one - which the single thumb counts as. A replaced thumb is still
  /// there to be dragged, it is just no longer drawn; `RNCSliderView` lays the
  /// view JS gave over it instead.
  @Published var customThumbCount: Int = 0

  /// The value a thumb had when the drag in progress began, or `nil` when that
  /// thumb is not being dragged. The single thumb keeps its origin in the left
  /// one of the two.
  ///
  /// A drag is tracked by how far it has travelled rather than by where the
  /// finger is, so grabbing a thumb off-centre does not snap it under the finger.
  var leftDragOrigin: Double?
  var rightDragOrigin: Double?

  /// Whether the user has hold of a thumb, which is simply whether either of the
  /// origins above is set.
  ///
  /// While the user drags, the thumb position is owned by this view. Value
  /// updates coming from JS in the meantime would fight the gesture, so they are
  /// ignored - the slider is uncontrolled for the duration of the drag.
  var isSliding: Bool { leftDragOrigin != nil || rightDragOrigin != nil }

  /// Invoked continuously while the user drags the thumb.
  var onValueChange: ((Double) -> Void)?

  /// Invoked continuously while the user drags the respective thumb of a ranged
  /// slider.
  var onLeftValueChange: ((Double) -> Void)?
  var onRightValueChange: ((Double) -> Void)?

  /// Invoked once the user takes hold of a thumb, and again once they let go of
  /// it - whether or not the drag in between moved it anywhere.
  var onSlidingStart: (() -> Void)?
  var onSlidingComplete: (() -> Void)?

  /// SwiftUI traps on an empty or descending range. Props arrive one at a time,
  /// so a momentarily inverted range is expected rather than exceptional.
  var range: ClosedRange<Double> {
    maximumValue > minimumValue ? minimumValue...maximumValue : minimumValue...(minimumValue + 1)
  }

  /// The range narrowed down to the part of it the thumbs can be dragged across.
  ///
  /// A limit that cannot be honoured is dropped: limits that have crossed leave
  /// the slider unlimited, and one reaching out of the range limits only as far
  /// as the range itself goes.
  var limits: ClosedRange<Double> {
    let range = self.range
    guard lowerLimit <= upperLimit else { return range }

    return lowerLimit.clamped(to: range)...upperLimit.clamped(to: range)
  }
}

/// Where the thumbs of the slider sit in a view of the given size.
///
/// The slider draws the thumbs, but a custom thumb from JS is a UIKit view laid
/// over it, so both of them read the geometry from here to agree on where a
/// thumb is.
///
/// The geometry is written along two axes rather than across the view: values
/// are spread along its *length*, and the thumbs are as thick as its *breadth*
/// allows. A thumb has a length and a thickness of its own too, as the thumb
/// `Slider` draws is not round everywhere - see `thumbLength`. Which of the view's two sides each of those is comes from
/// `RNCSliderModel.vertical`.
struct RNCSliderGeometry {
  let size: CGSize
  let vertical: Bool
  let range: ClosedRange<Double>
  let length: CGFloat
  let breadth: CGFloat

  /// The extent of a thumb along the slider and across it.
  ///
  /// A thumb is never thicker than the slider itself: JS decides how much room
  /// there is across it, and a thumb spilling out would draw over its
  /// neighbours. One that has to be thinner is shrunk as a whole, keeping its
  /// shape.
  let thumbLength: CGFloat
  let thumbThickness: CGFloat

  /// The span the near edge of a thumb moves across. The thumbs of a ranged
  /// slider stay fully inside the view, so it is short of the length by one
  /// thumb there.
  let travel: CGFloat

  /// Distance from the end of the view the minimum value sits at to the near
  /// edge of the left (or single) and of the right thumb.
  let leftOffset: CGFloat
  let rightOffset: CGFloat

  init(model: RNCSliderModel, size: CGSize) {
    self.size = size
    vertical = model.vertical
    range = model.range
    length = vertical ? size.height : size.width
    breadth = vertical ? size.width : size.height
    let thumbScale = min(breadth / Self.thumbThickness, 1)
    thumbLength = Self.thumbLength * thumbScale
    thumbThickness = Self.thumbThickness * thumbScale
    travel = max(length - thumbLength, 0)
    leftOffset = CGFloat(Self.fraction(of: model.ranged ? model.valueLeft : model.value, in: range)) * travel
    rightOffset = CGFloat(Self.fraction(of: model.valueRight, in: range)) * travel
  }

  // Centre of the thumb whose near edge sits the given distance along the slider, in the coordinates of the view.
  // The thumbs lie along the middle of the view, and a vertical slider grows upwards.
  func thumbCenter(atOffset offset: CGFloat) -> CGPoint {
    let along = offset + thumbLength / 2

    return vertical
      ? CGPoint(x: size.width / 2, y: size.height - along)
      : CGPoint(x: along, y: size.height / 2)
  }

  static func fraction(of value: Double, in range: ClosedRange<Double>) -> Double {
    let span = range.upperBound - range.lowerBound
    guard span > 0 else { return 0 }

    return ((value - range.lowerBound) / span).clamped(to: 0...1)
  }

  /// Match the thumb `UISlider` draws: a capsule lying along the track since
  /// iOS 26, and a circle before it.
  static var thumbLength: CGFloat {
    if #available(iOS 26.0, *) {
      return 38
    }
    return 28
  }

  static var thumbThickness: CGFloat {
    if #available(iOS 26.0, *) {
      return 24
    }
    return 28
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
      in: range
    )
  }
}

/// SwiftUI has no two-thumb slider and no vertical one, so the slider is drawn
/// here: a track, the selected span, and a thumb at each end of it. The shape
/// follows `Slider` - a capsule track with the selected part tinted, and a white
/// capsule thumb that turns to Liquid Glass while it is held on iOS 26 - so that
/// this slider does not look foreign next to a plain one.
///
/// Where everything goes is worked out by `RNCSliderGeometry` - and on a
/// vertical slider the left thumb is the bottom one, the direction its value
/// grows in being the only thing that changes.
struct RNCRangedSliderContent: View {
  @ObservedObject var model: RNCSliderModel

  /// Which end of the range a thumb drags.
  private enum Thumb {
    case single
    case left
    case right
  }

  /// Whether the user has hold of the left (or single) and of the right thumb,
  /// which is what turns it to glass. Kept apart from the drag origins in the
  /// model, as a gesture state resets itself however the touch ends - a
  /// cancelled one included.
  @GestureState private var isLeftThumbPressed = false
  @GestureState private var isRightThumbPressed = false

  var body: some View {
    GeometryReader { proxy in
      let geometry = RNCSliderGeometry(model: model, size: proxy.size)
      let range = geometry.range
      let thumbSize = CGSize(
        width: model.vertical ? geometry.thumbThickness : geometry.thumbLength,
        height: model.vertical ? geometry.thumbLength : geometry.thumbThickness
      )
      let travel = geometry.travel
      let leftOffset = geometry.leftOffset
      let rightOffset = geometry.rightOffset

      let trackFillLength = model.ranged ? max(rightOffset - leftOffset, 0) : leftOffset
      let trackFillStartPoint = min(leftOffset, rightOffset) + geometry.thumbLength / 2
      let trackUpperStartPoint = model.ranged ? rightOffset : leftOffset
      let trackEndLength = model.ranged ? geometry.length - rightOffset : geometry.length - leftOffset

      let lowerColor = tint(model.minimumTrackColor, or: model.ranged ? Self.trackColor : .accentColor)
      let middleColor = tint(model.middleRangeTrackColor, or: .accentColor)
      let upperColor = tint(model.maximumTrackColor, or: Self.trackColor)

      // Everything is placed by how far along the slider it sits, so the stack
      // is anchored at the end the minimum value is at: the leading edge across
      // the view, and the bottom one up it.
      ZStack(alignment: model.vertical ? .bottom : .leading) {
        track(Self.trackColor, length: nil)

        track(lowerColor, length: leftOffset)
        // Drawn between the two thumb centres, which is why it is inset by half
        // a thumb. `max` keeps it from inverting on values crossed by JS.
        if model.ranged {
          track(middleColor, length: trackFillLength)
            .offset(offsetAlong(trackFillStartPoint))
        }

        track(upperColor, length: trackEndLength).offset(offsetAlong(trackUpperStartPoint))
        if model.ranged {
          thumb(.right, size: thumbSize, offset: rightOffset, range: range, travel: travel)
          thumb(.left, size: thumbSize, offset: leftOffset, range: range, travel: travel)
            .zIndex(model.valueLeft >= range.upperBound ? 1 : 0)
        } else {
          thumb(.single, size: thumbSize, offset: leftOffset, range: range, travel: travel)
        }
      }
      .frame(width: proxy.size.width, height: proxy.size.height)
    }
  }

  private func track(_ color: Color, length: CGFloat?) -> some View {
    Capsule()
      .fill(color)
      .frame(
        width: model.vertical ? Self.trackThickness : length,
        height: model.vertical ? length : Self.trackThickness
      )
  }

  private func tint(_ color: UIColor?, or fallback: Color) -> Color {
    color.map { Color(uiColor: $0) } ?? fallback
  }

  private func thumb(
    _ thumb: Thumb,
    size: CGSize,
    offset: CGFloat,
    range: ClosedRange<Double>,
    travel: CGFloat
  ) -> some View {
    // A thumb is a small thing to grab, and the two of them can end up right
    // next to each other, so the area that answers to a touch is padded out to
    // the 44pt Apple asks for, on whichever side of the thumb falls short of it.
    // The padding is then shifted back off the offset, leaving the thumb itself
    // where the value puts it.
    let horizontalSlop = Self.touchSlop(around: size.width)
    let verticalSlop = Self.touchSlop(around: size.height)
    let alongSlop = model.vertical ? verticalSlop : horizontalSlop

    return thumbFace(isReplaced: isCustom(thumb), isPressed: isPressed(thumb))
      .frame(width: size.width, height: size.height)
      .padding(.horizontal, horizontalSlop)
      .padding(.vertical, verticalSlop)
      .contentShape(Rectangle())
      .offset(offsetAlong(offset - alongSlop))
      .gesture(
        DragGesture(minimumDistance: 0)
          .updating(pressedState(of: thumb)) { _, isPressed, _ in isPressed = true }
          .onChanged { gesture in
            let origin = dragOrigin(of: thumb) ?? beginDrag(of: thumb)

            let travelled = travel > 0
              ? Double(dragDistance(of: gesture) / travel) * span(of: range)
              : 0
            set(origin + travelled, of: thumb)
          }
          .onEnded { _ in endDrag(of: thumb) }
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
          set(value(of: thumb) + step, of: thumb)
        case .decrement:
          set(value(of: thumb) - step, of: thumb)
        @unknown default:
          break
        }
      }
  }

  /// What a thumb looks like. A thumb JS has replaced is still here to be
  /// dragged, only undrawn - the clear capsule keeps its place.
  ///
  /// On iOS 26 a thumb that is held grows and turns to clear glass, the track
  /// showing through it, the way the thumb of `Slider` does. The glass only
  /// grows the thumb as it is drawn, so neither the touch area nor where the
  /// value puts the thumb move with it.
  @ViewBuilder
  private func thumbFace(isReplaced: Bool, isPressed: Bool) -> some View {
    if isReplaced {
      Capsule().fill(Color.clear)
    } else {
      #if compiler(>=6.2) && os(iOS)
      if #available(iOS 26.0, *) {
        Capsule()
          .fill(isPressed ? Color.clear : Color.white)
          .shadow(color: .black.opacity(isPressed ? 0 : 0.25), radius: 2, y: 1)
          .glassEffect(isPressed ? .clear.interactive() : .identity, in: Capsule())
          .scaleEffect(isPressed ? Self.pressedThumbScale : 1)
          .animation(.spring(response: 0.3, dampingFraction: 0.65), value: isPressed)
      } else {
        Capsule()
          .fill(Color.white)
          .shadow(color: .black.opacity(0.25), radius: 2, y: 1)
      }
      #else
      Capsule()
        .fill(Color.white)
        .shadow(color: .black.opacity(0.25), radius: 2, y: 1)
      #endif
    }
  }

  private func isPressed(_ thumb: Thumb) -> Bool {
    switch thumb {
    case .single, .left: return isLeftThumbPressed
    case .right: return isRightThumbPressed
    }
  }

  private func pressedState(of thumb: Thumb) -> GestureState<Bool> {
    switch thumb {
    case .single, .left: return $isLeftThumbPressed
    case .right: return $isRightThumbPressed
    }
  }

  private func isCustom(_ thumb: Thumb) -> Bool {
    switch thumb {
    case .single, .left: return model.customThumbCount > 0
    case .right: return model.customThumbCount > 1
    }
  }

  private func value(of thumb: Thumb) -> Double {
    switch thumb {
    case .single: return model.value
    case .left: return model.valueLeft
    case .right: return model.valueRight
    }
  }

  /// Moves one thumb, keeping it inside the limits and on its own side of the
  /// other thumb, and reports it to JS. The two thumbs cannot swap places.
  ///
  /// A thumb held against a limit stops moving, and a value that has not moved
  /// is not reported, so JS hears nothing of a drag carrying on beyond it.
  private func set(_ newValue: Double, of thumb: Thumb) {
    let stepped = snapped(newValue)
    let limits = model.limits

    switch thumb {
    case .single:
      let clamped = stepped.clamped(to: limits)
      guard clamped != model.value else { return }
      model.value = clamped
      model.onValueChange?(clamped)
    case .left:
      let clamped = stepped.clamped(
        to: limits.lowerBound...model.valueRight.clamped(to: limits)
      )
      guard clamped != model.valueLeft else { return }
      model.valueLeft = clamped
      model.onLeftValueChange?(clamped)
    case .right:
      let clamped = stepped.clamped(
        to: model.valueLeft.clamped(to: limits)...limits.upperBound
      )
      guard clamped != model.valueRight else { return }
      model.valueRight = clamped
      model.onRightValueChange?(clamped)
    }
  }

  /// Rounds a value to the nearest multiple of the step, which is the
  /// granularity JS is promised. A step of zero leaves the value alone.
  ///
  /// Clamping is left to the caller: a snapped value can land outside the
  /// limits or past the other thumb, and each thumb answers for that
  /// differently. The ends stay reachable that way, whether or not the step
  /// divides the range evenly.
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

  /// Takes hold of a thumb, remembering where it stood so that the drag can be
  /// tracked by how far it travels, and tells JS that a drag has begun.
  ///
  /// Only the thumb grabbed first reports a start: a second finger landing on the
  /// other thumb of a ranged slider joins the drag already in progress rather
  /// than beginning one of its own, so that every start is answered by exactly
  /// one complete.
  private func beginDrag(of thumb: Thumb) -> Double {
    let wasSliding = model.isSliding
    let origin = value(of: thumb)
    setDragOrigin(origin, of: thumb)

    if !wasSliding {
      model.onSlidingStart?()
    }

    return origin
  }

  /// Lets go of a thumb, and tells JS the drag is over once the last thumb has
  /// been let go of - whether or not it moved anywhere in between.
  private func endDrag(of thumb: Thumb) {
    // A drag that was never begun - a gesture that ended without ever having
    // changed - has nothing to report.
    guard dragOrigin(of: thumb) != nil else { return }

    setDragOrigin(nil, of: thumb)

    if !model.isSliding {
      model.onSlidingComplete?()
    }
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

  private func span(of range: ClosedRange<Double>) -> Double {
    range.upperBound - range.lowerBound
  }

  /// How far a drag has carried a thumb along the slider, towards the maximum
  /// value. A vertical slider grows upwards, which SwiftUI's vertical
  /// coordinates run backwards along.
  private func dragDistance(of gesture: DragGesture.Value) -> CGFloat {
    model.vertical ? -gesture.translation.height : gesture.translation.width
  }

  /// A shift of the given distance along the slider, away from the end its
  /// minimum value sits at - the same direction `dragDistance(of:)` measures a
  /// drag in.
  private func offsetAlong(_ distance: CGFloat) -> CGSize {
    model.vertical ? CGSize(width: 0, height: -distance) : CGSize(width: distance, height: 0)
  }

  private func percentage(of value: Double, in range: ClosedRange<Double>) -> String {
    NumberFormatter.localizedString(
      from: NSNumber(value: RNCSliderGeometry.fraction(of: value, in: range)),
      number: .percent
    )
  }

  /// How much to grow a thumb by on either side of the given extent of it, to
  /// reach the 44pt Apple asks for a touch target to be.
  private static func touchSlop(around extent: CGFloat) -> CGFloat {
    max((minimumTouchTarget - extent) / 2, 0)
  }

  private static let minimumTouchTarget: CGFloat = 44

  /// How much bigger a held thumb is drawn, as `Slider` grows its own.
  private static let pressedThumbScale: CGFloat = 1.5

  private static let trackThickness: CGFloat = 4

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

  /// The views JS rendered in place of the built-in thumbs, in the order it
  /// rendered them: the single thumb, or the left and then the right one.
  private var thumbViews: [UIView] = []

  /// One for each thumb there can be, holding the view that replaces it. Each
  /// is kept centred on its thumb and takes up no room of its own: the shadow
  /// node centres the view it holds on its origin, so the view ends up centred
  /// on the thumb too.
  ///
  /// They take no touches, which leaves every drag to the slider underneath.
  private let thumbContainers: [UIView] = (0..<2).map { _ in
    let container = UIView()
    container.isUserInteractionEnabled = false
    return container
  }

  /// Keeps the custom thumbs moving with the slider - see `layoutSubviews`.
  private var modelObservation: AnyCancellable?

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

  /// Bounds the thumbs can be dragged between - see `RNCSliderModel.limits`. A
  /// value pushed from JS is taken as it comes, so only the values the slider
  /// arrives at itself are held to the limits.
  @objc public var lowerLimit: Double {
    get { model.lowerLimit }
    set { model.lowerLimit = newValue }
  }

  @objc public var upperLimit: Double {
    get { model.upperLimit }
    set { model.upperLimit = newValue }
  }

  /// Whether the slider runs up the view rather than across it - see
  /// `RNCSliderModel.vertical`. The shadow node measures a vertical slider the
  /// other way round to match, so this only decides how it is drawn and dragged.
  @objc public var vertical: Bool {
    get { model.vertical }
    set { model.vertical = newValue }
  }

  /// Tints of the parts of the track - see `RNCSliderModel.minimumTrackColor`.
  @objc public var minimumTrackColor: UIColor? {
    get { model.minimumTrackColor }
    set { model.minimumTrackColor = newValue }
  }

  @objc public var middleRangeTrackColor: UIColor? {
    get { model.middleRangeTrackColor }
    set { model.middleRangeTrackColor = newValue }
  }

  @objc public var maximumTrackColor: UIColor? {
    get { model.maximumTrackColor }
    set { model.maximumTrackColor = newValue }
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

  @objc public var onSlidingStart: (() -> Void)? {
    get { model.onSlidingStart }
    set { model.onSlidingStart = newValue }
  }

  @objc public var onSlidingComplete: (() -> Void)? {
    get { model.onSlidingComplete }
    set { model.onSlidingComplete = newValue }
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
    thumbContainers.forEach(addSubview)

    // Every change the slider could redraw its thumbs for may have moved them,
    // a drag above all. It is only announced before it lands, so the custom
    // thumbs are moved in the layout pass that follows it.
    modelObservation = model.objectWillChange.sink { [weak self] _ in
      self?.setNeedsLayout()
    }
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
  /// platform's own slider height keeps the two the same size. A vertical
  /// slider is too - it is the same control on its side, so its shadow node
  /// turns this size round rather than measuring a second one.
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
  ///
  /// The drag is abandoned rather than ended: the JS that would have heard the
  /// completion is no longer mounted on this view.
  @objc public func cancelSliding() {
    model.leftDragOrigin = nil
    model.rightDragOrigin = nil
  }

  /// Takes a view JS rendered in place of a built-in thumb - see
  /// `thumbViews`.
  @objc(mountThumbView:atIndex:)
  public func mountThumbView(_ view: UIView, at index: Int) {
    thumbViews.insert(view, at: min(index, thumbViews.count))
    thumbViewsDidChange()
  }

  @objc(unmountThumbView:)
  public func unmountThumbView(_ view: UIView) {
    thumbViews.removeAll { $0 === view }
    view.removeFromSuperview()
    thumbViewsDidChange()
  }

  private func thumbViewsDidChange() {
    // A view inserted ahead of another moves that one onto the next thumb.
    for (container, view) in zip(thumbContainers, thumbViews) where view.superview !== container {
      container.addSubview(view)
    }

    model.customThumbCount = min(thumbViews.count, thumbContainers.count)
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    hostingController.view.frame = bounds

    // The hosted slider fills this view, so its geometry is this view's too.
    let geometry = RNCSliderGeometry(model: model, size: bounds.size)
    thumbContainers[0].center = geometry.thumbCenter(atOffset: geometry.leftOffset)
    thumbContainers[1].center = geometry.thumbCenter(atOffset: geometry.rightOffset)
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
