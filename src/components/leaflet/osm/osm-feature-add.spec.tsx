import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { AddForests } from "@/stories/leaflet/leaflet-osm.stories";

describe("<OsmFeatureAdd />", () => {
  it("renders a button with the add-forest-patches label", async () => {
    const screen = render(<AddForests />);
    await expect
      .element(screen.getByRole("button", { name: /add forest patches/i }))
      .toBeInTheDocument();
  });
});
