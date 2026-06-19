import SwiftUI

struct SliderComponent: View {
  @EnvironmentObject var state: SliderState

  @State private var value: Double = 0

  var body: some View {
    VStack {
      Slider(
        value: $value,
        in: state.minValue...state.maxValue,
        step: state.step
      )
    }
  }
}

class SliderState: ObservableObject {
  @Published var minValue: Double = 0
  @Published var maxValue: Double = 1
  @Published var step: Double = 1
  @Published var color: Color = .accentColor
  @Published var onValueChange: (Double) -> Void = { _ in }
}

class SliderView: UIView {
  private var state: SliderState = SliderState()
    
  override init(frame: CGRect) {
    super.init(frame: frame)
    let hostingController = UIHostingController(rootView: SliderComponent().environmentObject(state))
    addSubview(hostingController.view)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func layoutSubviews() {
    subviews.first?.frame = self.frame
  }
}
