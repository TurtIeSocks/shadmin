import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { WaterClipBasic } from "@/stories/leaflet-osm.stories";

describe("<OsmWaterClipButton />", () => {
  it("renders a button labeled with water-clip text", async () => {
    const screen = render(<WaterClipBasic />);
    await expect
      .element(screen.getByRole("button", { name: /water/i }))
      .toBeInTheDocument();
  });
});
