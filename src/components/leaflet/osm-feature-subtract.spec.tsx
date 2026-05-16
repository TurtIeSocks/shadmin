import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/leaflet/osm-feature-subtract.stories";

/**
 * Pure render assertion: live Overpass API calls don't fire until the user
 * clicks the button. The DOM that renders BEFORE any network call already
 * includes the labelled action button, which is what we assert here.
 */
describe("<OsmFeatureSubtract />", () => {
  it("renders the labelled subtract button alongside the polygon map", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /subtract water/i }))
      .toBeInTheDocument();
    // The Basic story pairs OsmFeatureSubtract with a PolygonInput → a Leaflet
    // map is mounted on the same page.
    expect(screen.container.querySelector(".leaflet-container")).not.toBeNull();
  });
});
