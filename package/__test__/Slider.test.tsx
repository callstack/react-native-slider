import React from "react";
import {Text, ViewProps} from "react-native";
import {act, fireEvent, render, within} from "@testing-library/react-native";
import Slider from "../src/Slider";
import type {ThumbProps} from "../typings";

const StepThumb = ({index}: ThumbProps) => <Text>{`step ${index}`}</Text>;

describe("Slider", () => {
  it("Calls the given onValueChange when the native event is emitted", async () => {
    const onValueChange = jest.fn();
    const {getByTestId} = await render(
      <Slider testID="slider" onValueChange={onValueChange} />,
    );

    await fireEvent(getByTestId("slider"), "valueChange", {
      nativeEvent: {value: 2},
    });

    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it("Does not pass a handler down to the native component when none is given", async () => {
    const {getByTestId} = await render(<Slider testID="slider" />);

    expect(getByTestId("slider").props.onValueChange).toBeUndefined();
  });

  it("Forwards the range and the value to the native component", async () => {
    const {getByTestId} = await render(
      <Slider testID="slider" minimumValue={5} maximumValue={25} value={10} />,
    );
    const slider = getByTestId("slider");

    expect(slider.props.minimumValue).toBe(5);
    expect(slider.props.maximumValue).toBe(25);
    expect(slider.props.value).toBe(10);
  });

  it("Falls back to the default range and value", async () => {
    const {getByTestId} = await render(<Slider testID="slider" />);
    const slider = getByTestId("slider");

    expect(slider.props.minimumValue).toBe(0);
    expect(slider.props.maximumValue).toBe(1);
    expect(slider.props.value).toBe(0);
  });

  it("Forwards the step to the native component", async () => {
    const {getByTestId} = await render(<Slider testID="slider" step={0.25} />);

    expect(getByTestId("slider").props.step).toBe(0.25);
  });

  it("Falls back to a slider with no step", async () => {
    const {getByTestId} = await render(<Slider testID="slider" />);

    expect(getByTestId("slider").props.step).toBe(0);
  });

  describe("Custom thumb", () => {
    it("Renders nothing inside the slider when no thumb is given", async () => {
      const {getByTestId} = await render(<Slider testID="slider" />);

      expect(getByTestId("slider").children).toHaveLength(0);
    });

    it("Renders the thumb inside the slider, told the step it stands on", async () => {
      const {getByTestId, getByText} = await render(
        <Slider
          testID="slider"
          minimumValue={0}
          maximumValue={50}
          step={1}
          value={20}
          thumb={StepThumb}
        />,
      );

      expect(getByTestId("slider").children).toHaveLength(1);
      expect(getByText("step 20")).toBeTruthy();
    });

    it("Hosts each thumb in a view of its own that leaves touches to the slider", async () => {
      const {getByTestId} = await render(
        <Slider testID="slider" ranged thumb={StepThumb} />,
      );
      const thumbHosts = getByTestId("slider").children;

      expect(thumbHosts).toHaveLength(2);
      thumbHosts.forEach((thumbHost) => {
        expect(typeof thumbHost).not.toBe("string");
        const {props} = thumbHost as {props: ViewProps};
        expect(props.collapsable).toBe(false);
        expect(props.pointerEvents).toBe("none");
      });
    });

    it("Counts the steps from the minimum value", async () => {
      const {getByText} = await render(
        <Slider
          minimumValue={10}
          maximumValue={100}
          step={10}
          value={40}
          thumb={StepThumb}
        />,
      );

      expect(getByText("step 3")).toBeTruthy();
    });

    it("Counts a step the value does not land on exactly as the nearest one", async () => {
      const {getByText} = await render(
        <Slider maximumValue={1} step={0.1} value={0.3} thumb={StepThumb} />,
      );

      expect(getByText("step 3")).toBeTruthy();
    });

    it("Places a value outside the range at the nearest end of it", async () => {
      const {getByText, rerender} = await render(
        <Slider maximumValue={5} step={1} value={9} thumb={StepThumb} />,
      );

      expect(getByText("step 5")).toBeTruthy();

      await rerender(
        <Slider maximumValue={5} step={1} value={-3} thumb={StepThumb} />,
      );

      expect(getByText("step 0")).toBeTruthy();
    });

    it("Reports step 0 on a slider with no step", async () => {
      const {getByText} = await render(
        <Slider value={0.7} thumb={StepThumb} />,
      );

      expect(getByText("step 0")).toBeTruthy();
    });

    it("Follows the value the user drags the thumb to", async () => {
      const {getByTestId, getByText} = await render(
        <Slider testID="slider" maximumValue={50} step={1} thumb={StepThumb} />,
      );

      await fireEvent(getByTestId("slider"), "valueChange", {
        nativeEvent: {value: 7},
      });

      expect(getByText("step 7")).toBeTruthy();
    });

    it("Still calls the given onValueChange", async () => {
      const onValueChange = jest.fn();
      const {getByTestId} = await render(
        <Slider
          testID="slider"
          maximumValue={50}
          step={1}
          onValueChange={onValueChange}
          thumb={StepThumb}
        />,
      );

      await fireEvent(getByTestId("slider"), "valueChange", {
        nativeEvent: {value: 7},
      });

      expect(onValueChange).toHaveBeenCalledWith(7);
    });

    it("Listens for the value even when no handler is given for it", async () => {
      const {getByTestId} = await render(
        <Slider testID="slider" thumb={StepThumb} />,
      );
      const slider = getByTestId("slider");

      expect(slider.props.onValueChange).toBeDefined();
      expect(slider.props.onLeftValueChange).toBeDefined();
      expect(slider.props.onRightValueChange).toBeDefined();
    });

    it("Moves back to a value given in props after a drag", async () => {
      const {getByTestId, getByText, rerender} = await render(
        <Slider
          testID="slider"
          maximumValue={50}
          step={1}
          value={10}
          thumb={StepThumb}
        />,
      );

      await fireEvent(getByTestId("slider"), "valueChange", {
        nativeEvent: {value: 7},
      });
      await rerender(
        <Slider
          testID="slider"
          maximumValue={50}
          step={1}
          value={30}
          thumb={StepThumb}
        />,
      );

      expect(getByText("step 30")).toBeTruthy();
    });

    it("Renders a thumb at each end of a ranged slider, left one first", async () => {
      const {getByTestId} = await render(
        <Slider
          testID="slider"
          ranged
          maximumValue={100}
          step={10}
          valueLeft={20}
          valueRight={80}
          thumb={StepThumb}
        />,
      );

      const [left, right] = getByTestId("slider").children;

      expect(typeof left).not.toBe("string");
      expect(typeof right).not.toBe("string");
      if (typeof left !== "string" && typeof right !== "string") {
        expect(within(left).getByText("step 2")).toBeTruthy();
        expect(within(right).getByText("step 8")).toBeTruthy();
      }
    });

    it("Follows each thumb of a ranged slider on its own", async () => {
      const onLeftValueChange = jest.fn();
      const onRightValueChange = jest.fn();
      const {getByTestId, getByText, queryByText} = await render(
        <Slider
          testID="slider"
          ranged
          maximumValue={100}
          step={10}
          valueLeft={20}
          valueRight={80}
          onLeftValueChange={onLeftValueChange}
          onRightValueChange={onRightValueChange}
          thumb={StepThumb}
        />,
      );
      const slider = getByTestId("slider");

      await fireEvent(slider, "leftValueChange", {nativeEvent: {value: 40}});
      expect(getByText("step 4")).toBeTruthy();
      expect(getByText("step 8")).toBeTruthy();
      expect(queryByText("step 2")).toBeNull();

      await fireEvent(slider, "rightValueChange", {nativeEvent: {value: 60}});
      expect(getByText("step 4")).toBeTruthy();
      expect(getByText("step 6")).toBeTruthy();
      expect(queryByText("step 8")).toBeNull();

      expect(onLeftValueChange).toHaveBeenCalledWith(40);
      expect(onRightValueChange).toHaveBeenCalledWith(60);
    });

    it("Drops the second thumb when the slider stops being ranged", async () => {
      const {getByTestId, rerender} = await render(
        <Slider testID="slider" ranged thumb={StepThumb} />,
      );

      expect(getByTestId("slider").children).toHaveLength(2);

      await act(async () => {
        await rerender(<Slider testID="slider" thumb={StepThumb} />);
      });

      expect(getByTestId("slider").children).toHaveLength(1);
    });
  });
});
