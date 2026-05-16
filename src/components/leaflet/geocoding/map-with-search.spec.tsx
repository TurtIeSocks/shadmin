import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { MapWithSearchBasic } from "@/stories/leaflet/leaflet-geocoding.stories";

describe("<MapWithSearch />", () => {
  it("renders both the map and the geocoding input", async () => {
    const screen = render(<MapWithSearchBasic />);
    await expect
      .element(screen.getByPlaceholder(/search/i))
      .toBeInTheDocument();
  });
});
