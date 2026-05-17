import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, CustomLabel } from "@/stories/admin/select-all-button.stories";

describe("<SelectAllButton />", () => {
  it("renders a Select All button", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /select all/i }))
      .toBeInTheDocument();
  });

  it("renders the custom label when provided", async () => {
    const screen = render(<CustomLabel />);
    await expect
      .element(screen.getByRole("button", { name: /select everything/i }))
      .toBeInTheDocument();
  });
});
