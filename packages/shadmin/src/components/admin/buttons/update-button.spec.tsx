import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Default,
  WithConfirm,
} from "@/components/admin/buttons/update-button.stories";

describe("<UpdateButton />", () => {
  it("renders the labeled update button", async () => {
    const screen = render(<Default />);
    await expect
      .element(screen.getByRole("button", { name: /reset views/i }))
      .toBeInTheDocument();
  });

  it("opens a confirmation dialog when the WithConfirm variant is clicked", async () => {
    const screen = render(<WithConfirm />);
    const button = screen.getByRole("button", { name: /reset views/i });
    await button.click();
    // The dialog renders a confirm button once opened.
    await expect
      .element(screen.getByRole("button", { name: /confirm/i }))
      .toBeInTheDocument();
  });
});
