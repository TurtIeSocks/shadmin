import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, NoIcon } from "@/stories/admin/menu-item-link.stories";

describe("<MenuItemLink />", () => {
  it("renders a sidebar link with the primary text", async () => {
    const screen = render(<Basic />);
    const link = screen.getByRole("link", { name: /Posts/i });
    await expect.element(link).toBeInTheDocument();
    await expect.element(link).toHaveAttribute("href", "/posts");
  });

  it("renders without an icon when none is supplied", async () => {
    const screen = render(<NoIcon />);
    await expect
      .element(screen.getByRole("link", { name: "Posts" }))
      .toBeInTheDocument();
  });
});
