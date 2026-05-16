import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "vitest-browser-react";

import { ReverseGeocodeFieldBasic } from "@/stories/leaflet/leaflet-geocoding.stories";

describe("<ReverseGeocodeField />", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("shows skeleton while loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {})),
    );
    const screen = render(<ReverseGeocodeFieldBasic />);
    await expect
      .element(screen.getByTestId("reverse-geocode-field-loading"))
      .toBeInTheDocument();
  });
});
