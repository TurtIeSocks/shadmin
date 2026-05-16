import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { GeocodingInputBasic } from "@/stories/leaflet-geocoding.stories";

describe("<GeocodingInput />", () => {
  it("renders an input with the placeholder", async () => {
    const screen = render(<GeocodingInputBasic />);
    await expect
      .element(screen.getByPlaceholder("Type an address…"))
      .toBeInTheDocument();
  });
});
