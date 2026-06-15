import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Disabled } from "./cancel-button.stories";

describe("<CancelButton />", () => {
  it("renders a Cancel button", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /cancel/i }))
      .toBeInTheDocument();
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    await expect
      .element(screen.getByRole("button", { name: /cancel/i }))
      .toBeDisabled();
  });

  it("does not throw when clicked", async () => {
    const screen = render(<Basic />);
    const button = screen.getByRole("button", { name: /cancel/i });
    // Should not throw; navigate(-1) is a no-op when there is no history.
    await button.click();
    await expect.element(button).toBeInTheDocument();
  });
});
