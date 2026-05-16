import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { SubtractWater } from "@/stories/leaflet/leaflet-osm.stories";

describe("<OsmFeatureSubtract />", () => {
  it("renders a button with the subtract-water label", async () => {
    const screen = render(<SubtractWater />);
    await expect
      .element(screen.getByRole("button", { name: /subtract water/i }))
      .toBeInTheDocument();
  });
});
