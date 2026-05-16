import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  MissingCoordinates,
} from "@/stories/leaflet/lat-lng-field.stories";

describe("<LatLngField />", () => {
  it("renders a Leaflet map container when coordinates exist", async () => {
    const screen = render(<Basic />);
    const container = await screen.getByTestId("lat-lng-field");
    await expect.element(container).toBeInTheDocument();
    const el = container.element();
    expect(el.getAttribute("data-slot")).toBe("lat-lng-field");
    // Leaflet always tags the map container element with `.leaflet-container`.
    expect(el.querySelector(".leaflet-container")).not.toBeNull();
  });

  it("returns the empty-state panel when coordinates are missing", async () => {
    const screen = render(<MissingCoordinates />);
    const field = screen.getByTestId("lat-lng-field");
    await expect.element(field).not.toBeInTheDocument();
  });
});
