import { describe, expect, it } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { GeocodingInputBasic } from "./leaflet-geocoding.stories";

describe("<GeocodingInput />", () => {
  it("renders an input with the placeholder", async () => {
    const screen = render(<GeocodingInputBasic />);
    await expect
      .element(screen.getByPlaceholder("Type an address…"))
      .toBeInTheDocument();
  });

  it("keeps focus across keystrokes and captures every character", async () => {
    // Regression for a previous bug where the combobox was split between a
    // `<PopoverTrigger><Command>` and a `<PopoverContent><Command>`. Every
    // keystroke triggered a popover re-render that remounted the trigger's
    // `<CommandInput>`, so only the first character was captured before focus
    // was lost. The fix keeps the `<CommandInput>` in a single stable subtree.
    const screen = render(<GeocodingInputBasic />);
    const input = screen.getByPlaceholder("Type an address…");
    await userEvent.type(input, "abc");
    await expect.element(input).toHaveValue("abc");
  });
});
