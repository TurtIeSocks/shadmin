import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, SingleAction } from "@/stories/admin/top-toolbar.stories";

describe("<TopToolbar />", () => {
  it("renders create and export buttons when used inside an Admin list", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("link", { name: /create/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /export/i }))
      .toBeInTheDocument();
  });

  it("renders only the single action when the toolbar has one child", async () => {
    const screen = render(<SingleAction />);
    await expect
      .element(screen.getByRole("link", { name: /create/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /export/i }))
      .not.toBeInTheDocument();
  });
});
