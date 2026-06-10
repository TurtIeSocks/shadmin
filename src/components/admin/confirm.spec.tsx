import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./confirm.stories";

describe("<Confirm />", () => {
  it("renders the trigger button while the dialog is closed by default", async () => {
    const screen = render(<Basic />);
    // The story wraps a custom DeleteButton that opens the Confirm dialog.
    const trigger = await screen.getByRole("button", { name: /delete/i });
    await expect.element(trigger).toBeInTheDocument();
  });

  it("opens the confirmation dialog when the trigger is clicked", async () => {
    const screen = render(<Basic />);
    const trigger = await screen.getByRole("button", { name: /delete/i });
    await trigger.click();
    // Once opened, the dialog renders the configured title and content.
    await expect
      .element(
        screen.getByText(/are you sure you want to delete this element\?/i),
      )
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/this action cannot be undone\./i))
      .toBeInTheDocument();
  });
});
