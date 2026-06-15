import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./columns-button.stories";

describe("<ColumnsButton />", () => {
  it("renders a Columns trigger button", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /columns/i }).first())
      .toBeInTheDocument();
  });

  it("opens the column toggles when clicked", async () => {
    const screen = render(<Basic />);
    // The page also renders per-cell "Columns" buttons inside data-table headers;
    // the popover trigger is the first button (in the actions area).
    const trigger = screen.getByRole("button", { name: /columns/i }).first();
    await trigger.click();
    // Once open, the column toggle popover should expose a Reset shortcut.
    await expect
      .poll(() => screen.getByText("Reset").elements().length, {
        timeout: 2000,
      })
      .toBeGreaterThan(0);
  });
});
