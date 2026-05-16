import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/resource-menu-item-group.stories";

describe("<ResourceMenuItemGroup />", () => {
  it("renders a labeled resource menu group", async () => {
    const screen = render(<Basic />);

    await expect.element(screen.getByText("Content")).toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /Posts/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /Comments/i }))
      .toBeInTheDocument();
  });

  it("collapses and expands labeled groups", async () => {
    const screen = render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Content" });
    const posts = screen.getByRole("link", { name: /Posts/i });

    await expect.element(posts).toBeVisible();

    await trigger.click();
    await expect.element(posts).not.toBeInTheDocument();

    await trigger.click();
    await expect
      .element(screen.getByRole("link", { name: /Posts/i }))
      .toBeVisible();
  });
});
