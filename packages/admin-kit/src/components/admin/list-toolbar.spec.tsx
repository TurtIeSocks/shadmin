import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./list-toolbar.stories";

describe("<ListToolbar />", () => {
  it("renders the filter form input alongside the export action", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByLabelText("Search").first())
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /export/i }))
      .toBeInTheDocument();
  });
});
