import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./multi-polygon-input.stories";

describe("<MultiPolygonInput />", () => {
  it("renders the labeled map input with a Leaflet container", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Territories")).toBeInTheDocument();
    // `shape-input-shell` testId pattern for `MultiPolygon` is `multipolygon-input`.
    const wrapper = await screen.getByTestId("multipolygon-input");
    await expect.element(wrapper).toBeInTheDocument();
    expect(
      wrapper.element().querySelector(".leaflet-container"),
    ).not.toBeNull();
  });
});
