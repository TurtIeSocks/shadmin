import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./shapes/line-string-input.stories";

describe("<LineStringInput />", () => {
  it("renders the labeled map input with a Leaflet container", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Route")).toBeInTheDocument();
    // `shape-input-shell` testId pattern for `LineString` is `linestring-input`.
    const wrapper = await screen.getByTestId("linestring-input");
    await expect.element(wrapper).toBeInTheDocument();
    expect(
      wrapper.element().querySelector(".leaflet-container"),
    ).not.toBeNull();
  });
});
