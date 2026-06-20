import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./reverse-geocode-field.stories";

/**
 * Reverse geocoding makes a real Nominatim HTTP request when coordinates are
 * present. We stub `fetch` with a never-resolving promise so the component
 * stays in its loading state — that's the deterministic DOM we assert on.
 */
describe("<ReverseGeocodeField />", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("shows the loading skeleton while the geocoding request is in-flight", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {})),
    );
    const screen = render(<Basic />);
    await expect
      .element(screen.getByTestId("reverse-geocode-field-loading"))
      .toBeInTheDocument();
  });
});
