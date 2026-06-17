import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/components/admin/buttons/toggle-filter-button.stories";

describe("<ToggleFilterButton />", () => {
  it("renders one button per filter preset", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: "Published" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: "Draft" }))
      .toBeInTheDocument();
  });

  it("toggles aria-pressed when clicked", async () => {
    const screen = render(<Basic />);
    const btn = screen.getByRole("button", { name: "Published" });
    await expect.element(btn).toHaveAttribute("aria-pressed", "false");
    await btn.click();
    await expect.element(btn).toHaveAttribute("aria-pressed", "true");
  });
});
