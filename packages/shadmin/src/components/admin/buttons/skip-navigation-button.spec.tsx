import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  CustomLabel,
  Default,
} from "@/components/admin/buttons/skip-navigation-button.stories";

describe("<SkipNavigationButton />", () => {
  it("renders the default skip-to-content button label", async () => {
    const screen = render(<Default />);
    await expect
      .element(screen.getByRole("button", { name: /skip to content/i }))
      .toBeInTheDocument();
  });

  it("preserves a user-supplied literal label", async () => {
    const screen = render(<CustomLabel />);
    await expect
      .element(screen.getByRole("button", { name: /jump to content/i }))
      .toBeInTheDocument();
  });
});
