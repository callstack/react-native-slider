import React from "react";
import {StyleSheet, Text, ViewProps} from "react-native";
import {act, fireEvent, render, within} from "@testing-library/react-native";
import Slider from "../src/Slider";
import type {StepsProps, ThumbProps, TrackProps} from "../typings";

const StepThumb = ({index}: ThumbProps) => <Text>{`step ${index}`}</Text>;

const StepMarker = ({index, value, marked}: StepsProps) => (
  <Text>{`marker ${index}: ${value}${marked ? " marked" : ""}`}</Text>
);

const TrackThatReports = ({disabled}: TrackProps) => (
  <Text>{`track${disabled ? " disabled" : ""}`}</Text>
);

const ThumbThatReports = ({index, disabled}: ThumbProps) => (
  <Text>{`step ${index}${disabled ? " disabled" : ""}`}</Text>
);

const MarkerThatReports = ({index, disabled}: StepsProps) => (
  <Text>{`marker ${index}${disabled ? " disabled" : ""}`}</Text>
);

const markerTexts = (texts: {props: {children?: unknown}}[]) =>
  texts.map(({props}) => props.children);

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

  describe("Disabled", () => {
    it("Forwards being switched off to the native component", async () => {
      const {getByTestId} = await render(<Slider testID="slider" disabled />);
      expect(getByTestId("slider").props.disabled).toBe(true);
    });

    it("Leaves a slider given no decision to make switched on", async () => {
      const {getByTestId} = await render(<Slider testID="slider" />);
      expect(getByTestId("slider").props.disabled).toBeUndefined();
    });

    it("Keeps forwarding the values a switched-off slider is to be shown at", async () => {
      const {getByTestId} = await render(
        <Slider
          testID="slider"
          disabled
          maximumValue={50}
          step={1}
          value={20}
          ranged
          valueLeft={10}
          valueRight={40}
        />,
      );
      const slider = getByTestId("slider");

      expect(slider.props.value).toBe(20);
      expect(slider.props.valueLeft).toBe(10);
      expect(slider.props.valueRight).toBe(40);
    });

    it("Tells a custom track and thumb that the Slider is switched off", async () => {
      const {getByText} = await render(
        <Slider
          disabled
          maximumValue={1}
          step={1}
          track={TrackThatReports}
          thumb={ThumbThatReports}
        />,
      );

      expect(getByText("track disabled")).toBeTruthy();
      expect(getByText("step 0 disabled")).toBeTruthy();
    });

    it("Tells every custom step marker that the Slider is switched off", async () => {
      const {getAllByText} = await render(
        <Slider
          disabled
          maximumValue={2}
          step={1}
          stepMarkers={MarkerThatReports}
        />,
      );

      expect(markerTexts(getAllByText(/^marker/))).toEqual([
        "marker 0 disabled",
        "marker 1 disabled",
        "marker 2 disabled",
      ]);
    });

    it("Tells both thumbs of a switched-off ranged Slider", async () => {
      const {getAllByText} = await render(
        <Slider disabled ranged step={1} thumb={ThumbThatReports} />,
      );

      expect(markerTexts(getAllByText(/^step/))).toEqual([
        "step 0 disabled",
        "step 1 disabled",
      ]);
    });

    it("Leaves a switched-on Slider's custom elements uninformed", async () => {
      const {queryByText, getByText} = await render(
        <Slider
          maximumValue={1}
          step={1}
          track={TrackThatReports}
          thumb={ThumbThatReports}
          stepMarkers={MarkerThatReports}
        />,
      );

      expect(queryByText("track disabled")).toBeNull();
      expect(queryByText("step 0 disabled")).toBeNull();
      expect(queryByText("marker 0 disabled")).toBeNull();
      expect(getByText("track")).toBeTruthy();
    });

    it("Switches the custom elements off and back on with the Slider", async () => {
      const {queryByText, getByText, rerender} = await render(
        <Slider maximumValue={1} step={1} thumb={ThumbThatReports} />,
      );

      expect(getByText("step 0")).toBeTruthy();

      await act(async () => {
        await rerender(
          <Slider
            disabled
            maximumValue={1}
            step={1}
            thumb={ThumbThatReports}
          />,
        );
      });

      expect(getByText("step 0 disabled")).toBeTruthy();

      await act(async () => {
        await rerender(
          <Slider maximumValue={1} step={1} thumb={ThumbThatReports} />,
        );
      });

      expect(queryByText("step 0 disabled")).toBeNull();
      expect(getByText("step 0")).toBeTruthy();
    });
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

  describe("Step markers", () => {
    it("Leaves the steps unmarked by default", async () => {
      const {getByTestId} = await render(<Slider testID="slider" step={1} />);
      const slider = getByTestId("slider");

      expect(slider.props.stepMarkers).toBe("none");
      expect(slider.children).toHaveLength(0);
    });

    it("Has the native slider mark the steps when asked to", async () => {
      const {getByTestId} = await render(
        <Slider testID="slider" step={1} stepMarkers />,
      );
      const slider = getByTestId("slider");

      expect(slider.props.stepMarkers).toBe("native");
      expect(slider.children).toHaveLength(0);
    });

    it("Leaves the steps unmarked when asked not to", async () => {
      const {getByTestId} = await render(
        <Slider testID="slider" step={1} stepMarkers={false} />,
      );

      expect(getByTestId("slider").props.stepMarkers).toBe("none");
    });

    it("Renders the given step marker for every step", async () => {
      const {getByTestId, getAllByText} = await render(
        <Slider
          testID="slider"
          minimumValue={10}
          maximumValue={20}
          step={5}
          value={15}
          stepMarkers={StepMarker}
        />,
      );
      const slider = getByTestId("slider");

      expect(slider.props.stepMarkers).toBe("custom");
      expect(markerTexts(getAllByText(/^marker/))).toEqual([
        "marker 0: 10",
        "marker 1: 15 marked",
        "marker 2: 20",
      ]);
    });

    it("Hosts each step marker in a view of its own that leaves touches to the slider", async () => {
      const {getByTestId} = await render(
        <Slider testID="slider" step={0.5} stepMarkers={StepMarker} />,
      );
      const markerHosts = getByTestId("slider").children;

      expect(markerHosts).toHaveLength(3);
      markerHosts.forEach((markerHost) => {
        expect(typeof markerHost).not.toBe("string");
        const {props} = markerHost as {props: ViewProps};
        expect(props.collapsable).toBe(false);
        expect(props.pointerEvents).toBe("none");
      });
    });

    it("Renders no step markers on a slider with no step", async () => {
      const {getByTestId} = await render(
        <Slider testID="slider" stepMarkers={StepMarker} />,
      );

      expect(getByTestId("slider").children).toHaveLength(0);
    });

    it("Ends on the maximum value when the step does not divide the range", async () => {
      const {getAllByText} = await render(
        <Slider maximumValue={7} step={3} stepMarkers={StepMarker} />,
      );

      expect(markerTexts(getAllByText(/^marker/))).toEqual([
        "marker 0: 0 marked",
        "marker 1: 3",
        "marker 2: 6",
        "marker 3: 7",
      ]);
    });

    it("Reports each step the way its step is written", async () => {
      const {getAllByText} = await render(
        <Slider maximumValue={0.3} step={0.1} stepMarkers={StepMarker} />,
      );

      expect(markerTexts(getAllByText(/^marker/))).toEqual([
        "marker 0: 0 marked",
        "marker 1: 0.1",
        "marker 2: 0.2",
        "marker 3: 0.3",
      ]);
    });

    it("Marks the step the user drags the thumb to", async () => {
      const {getByTestId, getByText, queryByText} = await render(
        <Slider
          testID="slider"
          maximumValue={4}
          step={1}
          stepMarkers={StepMarker}
        />,
      );

      await fireEvent(getByTestId("slider"), "valueChange", {
        nativeEvent: {value: 3},
      });

      expect(getByText("marker 3: 3 marked")).toBeTruthy();
      expect(queryByText("marker 0: 0 marked")).toBeNull();
    });

    it("Marks the step under each thumb of a ranged slider", async () => {
      const {getAllByText} = await render(
        <Slider
          ranged
          maximumValue={4}
          step={1}
          valueLeft={1}
          valueRight={3}
          stepMarkers={StepMarker}
        />,
      );

      expect(markerTexts(getAllByText(/marked$/))).toEqual([
        "marker 1: 1 marked",
        "marker 3: 3 marked",
      ]);
    });

    it("Renders the step markers after the custom track and thumb", async () => {
      const Track = () => <Text>track</Text>;
      const {getByTestId} = await render(
        <Slider
          testID="slider"
          maximumValue={1}
          step={1}
          track={Track}
          thumb={StepThumb}
          stepMarkers={StepMarker}
        />,
      );
      const slider = getByTestId("slider");
      const [track, thumb, ...markers] = slider.children;

      expect(slider.props.customTrack).toBe(true);
      expect(slider.props.customThumb).toBe(true);
      expect(typeof track).not.toBe("string");
      expect(typeof thumb).not.toBe("string");
      if (typeof track !== "string" && typeof thumb !== "string") {
        expect(within(track).getByText("track")).toBeTruthy();
        expect(within(thumb).getByText("step 0")).toBeTruthy();
      }
      expect(markers).toHaveLength(2);
    });

    it("Does not tell the native slider about a custom thumb when there is none", async () => {
      const {getByTestId} = await render(
        <Slider testID="slider" step={1} stepMarkers={StepMarker} />,
      );

      expect(getByTestId("slider").props.customThumb).toBe(false);
    });
  });

  // The direction is applied entirely on the native side. A value reversed here
  // would be reversed a second time there, and land back where it started.
  describe("Reading direction", () => {
    const VALUE_PROPS = [
      "minimumValue",
      "maximumValue",
      "value",
      "ranged",
      "valueLeft",
      "valueRight",
      "step",
      "lowerLimit",
      "upperLimit",
    ] as const;

    const valuesOf = (slider: {props: Record<string, unknown>}) =>
      VALUE_PROPS.reduce(
        (values, prop) => ({...values, [prop]: slider.props[prop]}),
        {} as Record<string, unknown>,
      );

    it("Carries the direction of its subtree down to the native component", async () => {
      const {getByTestId} = await render(
        <Slider testID="slider" style={{direction: "rtl"}} />,
      );

      expect(StyleSheet.flatten(getByTestId("slider").props.style)).toEqual(
        expect.objectContaining({direction: "rtl"}),
      );
    });

    it("Forwards the same values whichever way the slider reads", async () => {
      const props = {
        minimumValue: 10,
        maximumValue: 90,
        step: 5,
        lowerLimit: 20,
        upperLimit: 80,
        ranged: true,
        valueLeft: 30,
        valueRight: 70,
      };
      const {getByTestId: readingLeftToRight} = await render(
        <Slider testID="slider" {...props} />,
      );
      const {getByTestId: readingRightToLeft} = await render(
        <Slider testID="slider" {...props} style={{direction: "rtl"}} />,
      );

      expect(valuesOf(readingRightToLeft("slider"))).toEqual(
        valuesOf(readingLeftToRight("slider")),
      );
    });

    it("Counts a custom thumb's step the same whichever way the slider reads", async () => {
      const thumbForDirection = async (direction?: "rtl") => {
        const {getByText} = await render(
          <Slider
            minimumValue={0}
            maximumValue={50}
            step={1}
            value={20}
            thumb={StepThumb}
            style={direction ? {direction} : undefined}
          />,
        );

        return getByText(/^step /).props.children;
      };

      expect(await thumbForDirection("rtl")).toBe(await thumbForDirection());
    });

    it("Renders the same step markers, in the same order, whichever way the slider reads", async () => {
      const markersForDirection = async (direction?: "rtl") => {
        const {getAllByText} = await render(
          <Slider
            maximumValue={4}
            step={1}
            value={3}
            stepMarkers={StepMarker}
            style={direction ? {direction} : undefined}
          />,
        );

        return markerTexts(getAllByText(/^marker/));
      };

      const leftToRight = await markersForDirection();

      expect(leftToRight).toEqual([
        "marker 0: 0",
        "marker 1: 1",
        "marker 2: 2",
        "marker 3: 3 marked",
        "marker 4: 4",
      ]);
      expect(await markersForDirection("rtl")).toEqual(leftToRight);
    });

    it("Reports a dragged value to the handlers it was given, reading right-to-left", async () => {
      const onValueChange = jest.fn();
      const {getByTestId} = await render(
        <Slider
          testID="slider"
          onValueChange={onValueChange}
          style={{direction: "rtl"}}
        />,
      );

      await fireEvent(getByTestId("slider"), "valueChange", {
        nativeEvent: {value: 2},
      });

      expect(onValueChange).toHaveBeenCalledWith(2);
    });
  });
});
