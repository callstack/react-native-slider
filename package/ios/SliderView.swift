import SwiftUI
import UIKit

struct SliderComponent: View {
  @ObservedObject var state: SliderState

  private var value: Binding<Double> {
    Binding(
      get: { state.value },
      set: { state.setValue($0, notify: true) }
    )
  }

  @ViewBuilder
  private var nativeSlider: some View {
    if state.step > 0 {
      Slider(
        value: value,
        in: state.valueRange,
        step: state.step,
        onEditingChanged: state.setEditing(_:))
    } else {
      Slider(
        value: value,
        in: state.valueRange,
        onEditingChanged: state.setEditing(_:))
    }
  }

  var body: some View {
    GeometryReader { geometry in
      ZStack {
        nativeSlider
          .opacity(state.usesCustomVisuals ? 0 : 1)
          .tint(state.minimumTrackTintColor.map { Color(uiColor: $0) })
          .environment(\.layoutDirection, state.inverted ? .rightToLeft : .leftToRight)
          .allowsHitTesting(!state.usesCustomVisuals)

        if state.usesCustomVisuals {
          SliderVisual(state: state, width: geometry.size.width)
        }
      }
        .disabled(state.disabled)
        .contentShape(Rectangle())
        .sliderGesture(
          state: state,
          width: geometry.size.width,
          enabled: state.tapToSeek || state.usesCustomVisuals,
          minimumDistance: state.tapToSeek ? 0 : 1
        )
    }
  }
}

private struct SliderVisual: View {
  @ObservedObject var state: SliderState
  let width: CGFloat

  private let defaultThumbSize = CGSize(width: 28, height: 28)

  private var trackHeight: CGFloat {
    let imageHeight = [
      state.trackImage?.size.height,
      state.minimumTrackImage?.size.height,
      state.maximumTrackImage?.size.height,
    ]
      .compactMap { $0 }
      .max() ?? 0

    return max(4, min(imageHeight, 18))
  }

  private var thumbSize: CGSize {
    if state.thumbSize > 0 {
      let size = CGFloat(state.thumbSize)
      return CGSize(width: size, height: size)
    }

    if let thumbImage = state.thumbImage {
      let maxSide = max(thumbImage.size.width, thumbImage.size.height)
      guard maxSide > 0 else {
        return defaultThumbSize
      }

      let scale = min(1, defaultThumbSize.width / maxSide)
      return CGSize(width: thumbImage.size.width * scale, height: thumbImage.size.height * scale)
    }

    return defaultThumbSize
  }

  var body: some View {
    let percent = state.visualPercent
    let resolvedThumbSize = thumbSize
    let trackInset = resolvedThumbSize.width / 2
    let trackWidth = max(width - resolvedThumbSize.width, 0)
    let thumbCenterX = trackInset + trackWidth * percent
    let progressWidth = state.inverted ? trackWidth * (1 - percent) : trackWidth * percent
    let progressOffset = state.inverted ? trackWidth - progressWidth : 0

    ZStack(alignment: .leading) {
      ZStack(alignment: .leading) {
        SliderTrackSegment(
          width: trackWidth,
          height: trackHeight,
          color: state.maximumTrackTintColor ?? UIColor.systemGray4,
          image: state.maximumTrackVisualImage
        )

        SliderTrackSegment(
          width: progressWidth,
          height: trackHeight,
          color: state.minimumTrackTintColor ?? UIColor.systemBlue,
          image: state.minimumTrackVisualImage
        )
        .offset(x: progressOffset)
      }
      .frame(width: trackWidth, height: trackHeight, alignment: .leading)
      .clipShape(Capsule())
      .offset(x: trackInset)

      SliderThumb(
        color: state.thumbTintColor ?? UIColor.white,
        image: state.thumbImage,
        size: resolvedThumbSize
      )
      .offset(x: thumbCenterX - resolvedThumbSize.width / 2)
    }
    .frame(width: width, height: max(resolvedThumbSize.height, trackHeight), alignment: .center)
  }
}

private struct SliderTrackImage {
  let image: UIImage
  let leftCap: CGFloat
  let rightCap: CGFloat
}

private struct SliderTrackSegment: View {
  let width: CGFloat
  let height: CGFloat
  let color: UIColor
  let image: SliderTrackImage?

  var body: some View {
    let resolvedWidth = max(width, 0)

    Group {
      if let image {
        Image(
          uiImage: image.image.renderedSliderTrackImage(
            width: resolvedWidth,
            height: height,
            leftCap: image.leftCap,
            rightCap: image.rightCap
          )
        )
      } else {
        Color(uiColor: color)
      }
    }
    .frame(width: resolvedWidth, height: height)
  }
}

private struct SliderThumb: View {
  let color: UIColor
  let image: UIImage?
  let size: CGSize

  private var shadowOpacity: Double {
    color.cgColor.alpha > 0 ? 0.12 : 0
  }

  var body: some View {
    Group {
      if let image {
        Image(uiImage: image)
          .resizable()
      } else {
        Circle()
          .fill(Color(uiColor: color))
          .shadow(color: Color.black.opacity(shadowOpacity), radius: 4, x: 0, y: 1)
      }
    }
    .frame(width: size.width, height: size.height)
  }
}

private extension View {
  @ViewBuilder
  func sliderGesture(state: SliderState, width: CGFloat, enabled: Bool, minimumDistance: CGFloat) -> some View {
    if enabled {
      gesture(
        DragGesture(minimumDistance: minimumDistance)
          .onChanged { gesture in
            guard !state.disabled else {
              return
            }

            state.setEditing(true)
            state.setValueFromLocation(
              x: gesture.location.x,
              width: width,
              inset: state.gestureInset(for: width)
            )
          }
          .onEnded { _ in
            state.setEditing(false)
          }
      )
    } else {
      self
    }
  }
}

class SliderState: ObservableObject {
  @Published var value: Double = 0
  @Published var minValue: Double = 0
  @Published var maxValue: Double = 1
  @Published var step: Double = 0
  @Published var lowerLimit: Double = -Double.greatestFiniteMagnitude
  @Published var upperLimit: Double = Double.greatestFiniteMagnitude
  @Published var disabled: Bool = false
  @Published var inverted: Bool = false
  @Published var tapToSeek: Bool = false
  @Published var minimumTrackTintColor: UIColor?
  @Published var maximumTrackTintColor: UIColor?
  @Published var thumbTintColor: UIColor?
  @Published var thumbImage: UIImage?
  @Published var thumbSize: Double = 0
  @Published var trackImage: UIImage?
  @Published var minimumTrackImage: UIImage?
  @Published var maximumTrackImage: UIImage?

  var onValueChange: RCTDirectEventBlock?
  var onSlidingStart: RCTDirectEventBlock?
  var onSlidingComplete: RCTDirectEventBlock?

  private var isEditing = false

  var valueRange: ClosedRange<Double> {
    minValue...max(minValue, maxValue)
  }

  var usesCustomVisuals: Bool {
    maximumTrackTintColor != nil ||
      thumbTintColor != nil ||
      thumbImage != nil ||
      thumbSize > 0 ||
      trackImage != nil ||
      minimumTrackImage != nil ||
      maximumTrackImage != nil
  }

  fileprivate var minimumTrackVisualImage: SliderTrackImage? {
    if let minimumTrackImage {
      return SliderTrackImage(image: minimumTrackImage, leftCap: minimumTrackImage.size.width - 1, rightCap: 0)
    }

    if let trackImage {
      let capWidth = floor((trackImage.size.width - 1) / 2)
      return SliderTrackImage(image: trackImage, leftCap: capWidth, rightCap: capWidth)
    }

    return nil
  }

  fileprivate var maximumTrackVisualImage: SliderTrackImage? {
    if let maximumTrackImage {
      return SliderTrackImage(image: maximumTrackImage, leftCap: 0, rightCap: maximumTrackImage.size.width - 1)
    }

    if let trackImage {
      let capWidth = floor((trackImage.size.width - 1) / 2)
      return SliderTrackImage(image: trackImage, leftCap: capWidth, rightCap: capWidth)
    }

    return nil
  }

  var visualPercent: CGFloat {
    guard maxValue > minValue else {
      return inverted ? 1 : 0
    }

    let percent = min(max((value - minValue) / (maxValue - minValue), 0), 1)
    return CGFloat(inverted ? 1 - percent : percent)
  }

  func setMinValue(_ nextValue: Double) {
    minValue = nextValue
    normalizeRange()
    clampValue()
  }

  func setMaxValue(_ nextValue: Double) {
    maxValue = nextValue
    normalizeRange()
    clampValue()
  }

  func setStep(_ nextValue: Double) {
    step = max(nextValue, 0)
    clampValue()
  }

  func setValue(_ nextValue: Double, notify: Bool) {
    let nextValue = clampedValue(snappedValue(nextValue))

    if value != nextValue {
      value = nextValue
    }

    if notify {
      onValueChange?(eventPayload())
    }
  }

  func setExternalValue(_ nextValue: Double) {
    guard !isEditing else {
      return
    }

    setValue(nextValue, notify: false)
  }

  func setEditing(_ editing: Bool) {
    guard editing != isEditing else {
      return
    }

    isEditing = editing

    if editing {
      onSlidingStart?(eventPayload())
    } else {
      onSlidingComplete?(eventPayload())
    }
  }

  func gestureInset(for width: CGFloat) -> CGFloat {
    if thumbSize > 0 {
      return min(CGFloat(thumbSize) / 2, width / 2)
    }

    if let thumbImage {
      return min(thumbImage.size.width / 2, width / 2)
    }

    return usesCustomVisuals ? min(14, width / 2) : 0
  }

  func setValueFromLocation(x: CGFloat, width: CGFloat, inset: CGFloat = 0) {
    guard !disabled else {
      return
    }

    let usableWidth = max(width - inset * 2, 1)
    let percent = min(max(Double((x - inset) / usableWidth), 0), 1)
    let directedPercent = inverted ? 1 - percent : percent
    let nextValue = minValue + directedPercent * (maxValue - minValue)
    setValue(nextValue, notify: true)
  }

  private func normalizeRange() {
    if maxValue < minValue {
      maxValue = minValue
    }
  }

  private func clampValue() {
    setValue(value, notify: false)
  }

  private func clampedValue(_ nextValue: Double) -> Double {
    let lower = max(minValue, lowerLimit)
    let upper = min(maxValue, upperLimit)
    return min(max(nextValue, lower), max(lower, upper))
  }

  private func snappedValue(_ nextValue: Double) -> Double {
    guard step > 0 else {
      return nextValue
    }

    return minValue + round((nextValue - minValue) / step) * step
  }

  private func eventPayload() -> [String: Any] {
    ["value": value]
  }
}

private extension UIImage {
  func renderedSliderTrackImage(width: CGFloat, height: CGFloat, leftCap: CGFloat, rightCap: CGFloat) -> UIImage {
    let targetSize = CGSize(width: max(width, 1), height: max(height, 1))
    let imageWidth = max(size.width, 1)
    let sourceLeftCap = min(max(leftCap, 0), imageWidth)
    let sourceRightCap = min(max(rightCap, 0), imageWidth - sourceLeftCap)
    let sourceCenterWidth = max(imageWidth - sourceLeftCap - sourceRightCap, 0)

    let targetLeftCap = min(sourceLeftCap, targetSize.width)
    let targetRightCap = min(sourceRightCap, max(targetSize.width - targetLeftCap, 0))
    let targetCenterWidth = max(targetSize.width - targetLeftCap - targetRightCap, 0)

    let format = UIGraphicsImageRendererFormat()
    format.scale = UIScreen.main.scale
    format.opaque = false

    return UIGraphicsImageRenderer(size: targetSize, format: format).image { _ in
      drawSliderTrackSlice(
        sourceX: 0,
        sourceWidth: sourceLeftCap,
        destination: CGRect(x: 0, y: 0, width: targetLeftCap, height: targetSize.height)
      )

      drawSliderTrackSlice(
        sourceX: sourceLeftCap,
        sourceWidth: sourceCenterWidth,
        destination: CGRect(x: targetLeftCap, y: 0, width: targetCenterWidth, height: targetSize.height)
      )

      drawSliderTrackSlice(
        sourceX: imageWidth - sourceRightCap,
        sourceWidth: sourceRightCap,
        destination: CGRect(
          x: targetSize.width - targetRightCap,
          y: 0,
          width: targetRightCap,
          height: targetSize.height
        )
      )
    }
  }

  private func drawSliderTrackSlice(sourceX: CGFloat, sourceWidth: CGFloat, destination: CGRect) {
    guard sourceWidth > 0, destination.width > 0, destination.height > 0 else {
      return
    }

    guard let cgImage else {
      draw(in: destination)
      return
    }

    let scaleX = CGFloat(cgImage.width) / max(size.width, 1)
    let sourceRect = CGRect(
      x: sourceX * scaleX,
      y: 0,
      width: sourceWidth * scaleX,
      height: CGFloat(cgImage.height)
    )
      .integral

    guard let slice = cgImage.cropping(to: sourceRect) else {
      draw(in: destination)
      return
    }

    UIImage(cgImage: slice, scale: scale, orientation: imageOrientation).draw(in: destination)
  }
}

@objc(SliderView)
public class SliderView: UIView {
  private let state = SliderState()
  private var hostingController: UIHostingController<SliderComponent>?

  @objc public var minValue: Double = 0 {
    didSet {
      state.setMinValue(minValue)
    }
  }

  @objc public var maxValue: Double = 1 {
    didSet {
      state.setMaxValue(maxValue)
    }
  }

  @objc public var step: Double = 0 {
    didSet {
      state.setStep(step)
    }
  }

  @objc public var value: Double = 0 {
    didSet {
      state.setExternalValue(value)
    }
  }

  @objc public var lowerLimit: Double = -Double.greatestFiniteMagnitude {
    didSet {
      state.lowerLimit = lowerLimit
      state.setValue(state.value, notify: false)
    }
  }

  @objc public var upperLimit: Double = Double.greatestFiniteMagnitude {
    didSet {
      state.upperLimit = upperLimit
      state.setValue(state.value, notify: false)
    }
  }

  @objc public var disabled: Bool = false {
    didSet {
      state.disabled = disabled
    }
  }

  @objc public var inverted: Bool = false {
    didSet {
      state.inverted = inverted
    }
  }

  @objc public var tapToSeek: Bool = false {
    didSet {
      state.tapToSeek = tapToSeek
    }
  }

  @objc public var minimumTrackTintColor: UIColor? {
    didSet {
      state.minimumTrackTintColor = minimumTrackTintColor
    }
  }

  @objc public var maximumTrackTintColor: UIColor? {
    didSet {
      state.maximumTrackTintColor = maximumTrackTintColor
    }
  }

  @objc public var thumbTintColor: UIColor? {
    didSet {
      state.thumbTintColor = thumbTintColor
    }
  }

  @objc public var thumbImage: UIImage? {
    didSet {
      state.thumbImage = thumbImage
    }
  }

  @objc public var thumbSize: Double = 0 {
    didSet {
      state.thumbSize = thumbSize
    }
  }

  @objc public var trackImage: UIImage? {
    didSet {
      state.trackImage = trackImage
    }
  }

  @objc public var minimumTrackImage: UIImage? {
    didSet {
      state.minimumTrackImage = minimumTrackImage
    }
  }

  @objc public var maximumTrackImage: UIImage? {
    didSet {
      state.maximumTrackImage = maximumTrackImage
    }
  }

  @objc public var onValueChange: RCTDirectEventBlock? {
    didSet {
      state.onValueChange = onValueChange
    }
  }

  @objc public var onSlidingStart: RCTDirectEventBlock? {
    didSet {
      state.onSlidingStart = onSlidingStart
    }
  }

  @objc public var onSlidingComplete: RCTDirectEventBlock? {
    didSet {
      state.onSlidingComplete = onSlidingComplete
    }
  }

  public override init(frame: CGRect) {
    super.init(frame: frame)

    clipsToBounds = false
    layer.masksToBounds = false

    let hostingController = UIHostingController(rootView: SliderComponent(state: state))
    hostingController.view.backgroundColor = .clear
    hostingController.view.clipsToBounds = false
    hostingController.view.layer.masksToBounds = false
    addSubview(hostingController.view)
    self.hostingController = hostingController
  }

  public required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    hostingController?.view.frame = bounds
  }
}
