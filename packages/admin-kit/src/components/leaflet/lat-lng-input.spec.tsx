import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  EmptyValue,
  WithLabel,
} from "./lat-lng-input.stories";

describe("<LatLngInput />", () => {
  it("renders the map input wrapper with data-slot", async () => {
    const screen = render(<Basic />);
    const container = await screen.getByTestId("lat-lng-input");
    await expect.element(container).toBeInTheDocument();
    const el = container.element();
    expect(el.getAttribute("data-slot")).toBe("lat-lng-input");
    expect(el.querySelector(".leaflet-container")).not.toBeNull();
  });

  it("renders the label when provided", async () => {
    const screen = render(<WithLabel />);
    await expect
      .element(screen.getByText("Office location"))
      .toBeInTheDocument();
  });

  it("falls back to defaultPosition when the record has null coordinates", async () => {
    const screen = render(<EmptyValue />);
    await expect.element(screen.getByText("Pick a point")).toBeInTheDocument();
    const container = await screen.getByTestId("lat-lng-input");
    expect(
      container.element().querySelector(".leaflet-container"),
    ).not.toBeNull();
  });
});
