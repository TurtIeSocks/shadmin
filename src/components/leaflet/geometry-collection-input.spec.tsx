import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/leaflet/geometry-collection-input.stories";

describe("<GeometryCollectionInput />", () => {
  it("renders the labeled map input with a Leaflet container", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Mixed shapes")).toBeInTheDocument();
    // `GeometryCollectionInput` delegates to `GeoJsonInput`, which exposes the
    // map wrapper under `data-testid="geojson-input"`.
    const wrapper = await screen.getByTestId("geojson-input");
    await expect.element(wrapper).toBeInTheDocument();
    expect(
      wrapper.element().querySelector(".leaflet-container"),
    ).not.toBeNull();
  });
});
