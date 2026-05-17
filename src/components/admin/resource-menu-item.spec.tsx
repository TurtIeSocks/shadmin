import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  UnknownResource,
} from "@/stories/admin/resource-menu-item.stories";

describe("<ResourceMenuItem />", () => {
  it("renders a link to the resource list view", async () => {
    const screen = render(<Basic />);
    const link = screen.getByRole("link", { name: /Posts/i });
    await expect.element(link).toBeInTheDocument();
    await expect.element(link).toHaveAttribute("href", "/posts");
  });

  it("renders nothing for an unknown resource", async () => {
    const screen = render(<UnknownResource />);
    await expect.element(screen.getByRole("link")).not.toBeInTheDocument();
  });
});
