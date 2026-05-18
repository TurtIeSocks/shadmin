import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/theme-mode-toggle.stories";

describe("<ThemeModeToggle />", () => {
  it("renders the theme toggle button", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /toggle.*(theme|mode)/i }))
      .toBeInTheDocument();
  });

  it("exposes light / dark / system options when opened", async () => {
    const screen = render(<Basic />);
    await screen.getByRole("button", { name: /toggle.*(theme|mode)/i }).click();
    await expect
      .element(screen.getByRole("menuitem", { name: "Light" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("menuitem", { name: "Dark" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("menuitem", { name: "System" }))
      .toBeInTheDocument();
  });
});
