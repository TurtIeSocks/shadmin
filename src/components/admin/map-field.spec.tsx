import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic as MapFieldBasic,
  MissingCoordinates,
  BasicInput,
} from "@/stories/map-field.stories";

describe("<MapField />", () => {
  it("renders the map container with data-slot when coordinates exist", async () => {
    const screen = render(<MapFieldBasic />);
    const container = await screen.getByTestId("map-field");
    await expect.element(container).toBeInTheDocument();
    const el = container.element();
    expect(el.getAttribute("data-slot")).toBe("map-field");
  });

  it("returns null when coordinates are missing from the record", async () => {
    const screen = render(<MissingCoordinates />);
    const field = screen.getByTestId("map-field");
    await expect.element(field).not.toBeInTheDocument();
  });
});

describe("<MapInput />", () => {
  it("renders the map input with data-slot", async () => {
    const screen = render(<BasicInput />);
    const container = await screen.getByTestId("map-input");
    await expect.element(container).toBeInTheDocument();
    const el = container.element();
    expect(el.getAttribute("data-slot")).toBe("map-input");
  });

  it("renders the label when provided", async () => {
    const screen = render(<BasicInput />);
    const label = await screen.getByText("Map location");
    await expect.element(label).toBeInTheDocument();
  });

  it("renders the helper text when provided", async () => {
    const screen = render(<BasicInput />);
    const helper = await screen.getByText(
      "Click or drag the marker to set a location.",
    );
    await expect.element(helper).toBeInTheDocument();
  });
});
