import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  SingleLocale,
} from "@/stories/admin/locales-menu-button.stories";

describe("<LocalesMenuButton />", () => {
  it("renders the change-locale button when multiple locales are configured", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /change locale/i }))
      .toBeInTheDocument();
  });

  it("renders nothing when only one locale is configured", async () => {
    const screen = render(<SingleLocale />);
    await expect
      .element(screen.getByRole("button", { name: /change locale/i }))
      .not.toBeInTheDocument();
  });
});
