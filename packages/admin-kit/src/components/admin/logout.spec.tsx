import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./logout.stories";

describe("<Logout />", () => {
  it("exposes a logout menu item once the dropdown is opened", async () => {
    const screen = render(<Basic />);
    await screen.getByRole("button", { name: /open menu/i }).click();
    await expect
      .element(screen.getByRole("menuitem", { name: /logout/i }))
      .toBeInTheDocument();
  });
});
