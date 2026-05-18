import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, WithGroups } from "@/stories/admin/app-sidebar.stories";

describe("<AppSidebar />", () => {
  it("renders a navigation link for the registered resource", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("link", { name: /Posts/i }).first())
      .toBeInTheDocument();
  });

  it("renders group labels when resources declare a group", async () => {
    const screen = render(<WithGroups />);
    await expect
      .element(
        screen.getByRole("button", { name: "Content", exact: true }).first(),
      )
      .toBeInTheDocument();
    await expect
      .element(
        screen.getByRole("button", { name: "People", exact: true }).first(),
      )
      .toBeInTheDocument();
  });
});
