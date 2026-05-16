import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic as LatLngFieldBasic,
  MissingCoordinates,
  BasicInput,
} from "@/stories/leaflet/leaflet.stories";

describe("<LatLngField />", () => {
  it("renders the map container with data-slot when coordinates exist", async () => {
    const screen = render(<LatLngFieldBasic />);
    const container = await screen.getByTestId("lat-lng-field");
    await expect.element(container).toBeInTheDocument();
    const el = container.element();
    expect(el.getAttribute("data-slot")).toBe("lat-lng-field");
  });

  it("returns null when coordinates are missing from the record", async () => {
    const screen = render(<MissingCoordinates />);
    const field = screen.getByTestId("lat-lng-field");
    await expect.element(field).not.toBeInTheDocument();
  });
});

describe("<LatLngInput />", () => {
  it("renders the map input with data-slot", async () => {
    const screen = render(<BasicInput />);
    const container = await screen.getByTestId("lat-lng-input");
    await expect.element(container).toBeInTheDocument();
    const el = container.element();
    expect(el.getAttribute("data-slot")).toBe("lat-lng-input");
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
