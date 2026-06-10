import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./shapes/multi-point-input.stories";

describe("<MultiPointInput />", () => {
  it("renders the labeled map input with a Leaflet container", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Bus stops")).toBeInTheDocument();
    // `shape-input-shell` builds the testId as `${shape.toLowerCase()}-input`.
    // For `MultiPoint` that's `multipoint-input` (lowercase, no separators).
    const wrapper = await screen.getByTestId("multipoint-input");
    await expect.element(wrapper).toBeInTheDocument();
    expect(
      wrapper.element().querySelector(".leaflet-container"),
    ).not.toBeNull();
  });
});
