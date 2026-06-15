import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, WithCustomItems } from "./user-menu.stories";

describe("<UserMenu />", () => {
  it("renders the identity-based avatar button", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: "Jane Doe" }))
      .toBeInTheDocument();
  });

  it("exposes the logout item when opened", async () => {
    const screen = render(<Basic />);
    await screen.getByRole("button", { name: "Jane Doe" }).click();
    await expect
      .element(screen.getByRole("menuitem", { name: /logout/i }))
      .toBeInTheDocument();
  });

  it("renders custom items between the identity header and logout", async () => {
    const screen = render(<WithCustomItems />);
    await screen.getByRole("button", { name: "Jane Doe" }).click();
    await expect
      .element(screen.getByRole("menuitem", { name: /profile/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("menuitem", { name: /settings/i }))
      .toBeInTheDocument();
  });
});
