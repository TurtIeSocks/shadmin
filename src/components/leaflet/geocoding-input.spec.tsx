import { describe, expect, it } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/leaflet/geocoding-input.stories";

/**
 * Live Nominatim calls only fire after the user has typed at least `minChars`
 * (default 3) characters. The DOM-only assertions below run BEFORE any network
 * call is initiated; no real geocoder is required.
 */
describe("<GeocodingInput />", () => {
  it("renders an address combobox with the placeholder", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByPlaceholder("Type an address…"))
      .toBeInTheDocument();
  });

  it("keeps focus across keystrokes and captures every character typed", async () => {
    // Regression for a previous bug where the combobox was split between a
    // `<PopoverTrigger><Command>` and a `<PopoverContent><Command>`. Every
    // keystroke triggered a popover re-render that remounted the trigger's
    // `<CommandInput>`, so only the first character was captured before focus
    // was lost. The fix keeps the `<CommandInput>` in a single stable subtree.
    const screen = render(<Basic />);
    const input = screen.getByPlaceholder("Type an address…");
    await userEvent.type(input, "abc");
    await expect.element(input).toHaveValue("abc");
  });
});
