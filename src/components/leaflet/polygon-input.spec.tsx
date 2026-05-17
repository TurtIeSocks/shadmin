import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/leaflet/polygon-input.stories";

describe("<PolygonInput />", () => {
  it("renders the labeled map input with a Leaflet container", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Service area")).toBeInTheDocument();
    // `shape-input-shell` testId pattern for `Polygon` is `polygon-input`.
    const wrapper = await screen.getByTestId("polygon-input");
    await expect.element(wrapper).toBeInTheDocument();
    expect(
      wrapper.element().querySelector(".leaflet-container"),
    ).not.toBeNull();
  });
});
