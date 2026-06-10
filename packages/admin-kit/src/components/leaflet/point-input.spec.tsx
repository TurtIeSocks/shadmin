import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./shapes/point-input.stories";

describe("<PointInput />", () => {
  it("renders the labeled map input with a Leaflet container", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Pick a point")).toBeInTheDocument();
    const wrapper = await screen.getByTestId("point-input");
    await expect.element(wrapper).toBeInTheDocument();
    expect(
      wrapper.element().querySelector(".leaflet-container"),
    ).not.toBeNull();
  });
});
