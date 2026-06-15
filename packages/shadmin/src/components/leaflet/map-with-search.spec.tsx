import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./map-with-search.stories";

/**
 * Composite component: combines a draggable LatLngInput map with a
 * GeocodingInput search combobox. Live Nominatim calls don't fire until the
 * user types ≥ minChars characters or drags the marker. The assertions below
 * only inspect the pre-network DOM (search input + Leaflet map container).
 */
describe("<MapWithSearch />", () => {
  it("renders both the geocoding search input and the Leaflet map", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByPlaceholder(/search/i))
      .toBeInTheDocument();
    expect(screen.container.querySelector(".leaflet-container")).not.toBeNull();
  });
});
