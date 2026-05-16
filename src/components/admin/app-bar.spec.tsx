import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/app-bar.stories";

describe("<AppBar />", () => {
  it("renders the default toolbar (refresh + theme toggle) inside the header", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /toggle theme/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /refresh/i }))
      .toBeInTheDocument();
  });
});
