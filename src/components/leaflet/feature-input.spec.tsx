import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Seeded } from "./feature-input.stories";

describe("<FeatureInput />", () => {
  it("renders the labeled map input with a Leaflet container", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Feature")).toBeInTheDocument();
    // FeatureInput defaults to shape="Polygon"; `shape-input-shell` builds the
    // testId as `${shape.toLowerCase()}-input` ⇒ `polygon-input`.
    const wrapper = await screen.getByTestId("polygon-input");
    await expect.element(wrapper).toBeInTheDocument();
    expect(
      wrapper.element().querySelector(".leaflet-container"),
    ).not.toBeNull();
  });

  it("hydrates a seeded Feature value into a drawable Leaflet path", async () => {
    const screen = render(<Seeded />);
    // Seeded with a polygon Feature — react-leaflet draws it as a path.
    const path = screen.container.querySelector("path.leaflet-interactive");
    // The path may take a tick to mount under Geoman's FeatureGroup, so poll.
    let p: Element | null = path;
    for (let i = 0; i < 50 && !p; i++) {
      await new Promise((r) => setTimeout(r, 50));
      p = screen.container.querySelector("path.leaflet-interactive");
    }
    expect(p).not.toBeNull();
  });
});
