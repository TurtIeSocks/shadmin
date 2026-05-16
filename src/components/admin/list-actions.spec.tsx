import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, CustomChildren } from "@/stories/admin/list-actions.stories";

describe("<ListActions />", () => {
  it("renders create and export action buttons by default", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("link", { name: /create/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /export/i }))
      .toBeInTheDocument();
  });

  it("renders custom action children when provided", async () => {
    const screen = render(<CustomChildren />);
    await expect
      .element(screen.getByRole("link", { name: /create/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /export/i }))
      .toBeInTheDocument();
  });
});
