import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomClass,
} from "@/stories/admin/sidebar-toggle-button.stories";

describe("<SidebarToggleButton />", () => {
  it("renders the sidebar toggle button", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /toggle sidebar/i }))
      .toBeInTheDocument();
  });

  it("applies a custom className", async () => {
    const screen = render(<CustomClass />);
    await expect
      .element(screen.getByRole("button", { name: /toggle sidebar/i }))
      .toHaveClass("size-10");
  });
});
