import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Default,
  WithConfirm,
} from "./bulk-update-button.stories";

describe("<BulkUpdateButton />", () => {
  it("renders the labeled bulk update button", async () => {
    const screen = render(<Default />);
    await expect
      .element(screen.getByRole("button", { name: /reset views/i }))
      .toBeInTheDocument();
  });

  it("opens a confirmation dialog when WithConfirm variant is clicked", async () => {
    const screen = render(<WithConfirm />);
    const button = screen.getByRole("button", { name: /reset views/i });
    await button.click();
    // Confirm dialog renders an alert/dialog role containing a confirm button.
    await expect
      .element(screen.getByRole("button", { name: /confirm/i }))
      .toBeInTheDocument();
  });
});
