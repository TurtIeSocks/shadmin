import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./refresh-button.stories";

describe("<RefreshButton />", () => {
  it("renders an accessible refresh button", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /refresh/i }))
      .toBeInTheDocument();
  });

  it("clicking the refresh button does not throw", async () => {
    const screen = render(<Basic />);
    await screen.getByRole("button", { name: /refresh/i }).click();
  });
});
