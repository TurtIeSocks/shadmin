import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  EmptyValue,
} from "@/stories/leaflet/feature-collection-field.stories";

const findAsync = async (
  container: Element,
  selector: string,
): Promise<Element | null> => {
  let el: Element | null = null;
  for (let i = 0; i < 50 && !el; i++) {
    el = container.querySelector(selector);
    if (!el) await new Promise((r) => setTimeout(r, 50));
  }
  return el;
};

describe("<FeatureCollectionField />", () => {
  it("renders point + polygon features from a FeatureCollection", async () => {
    const screen = render(<Basic />);
    expect(screen.container.querySelector(".leaflet-container")).not.toBeNull();
    // The polygon feature renders as a path; the point feature as a marker.
    const path = await findAsync(screen.container, "path.leaflet-interactive");
    expect(path).not.toBeNull();
    const marker = await findAsync(screen.container, ".leaflet-marker-icon");
    expect(marker).not.toBeNull();
  });

  it("renders the empty-state panel when there is no geometry", async () => {
    const screen = render(<EmptyValue />);
    await expect
      .element(screen.getByText(/no geometry available/i))
      .toBeInTheDocument();
  });
});
