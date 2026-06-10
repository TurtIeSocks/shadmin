import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./not-found.stories";

describe("<NotFound />", () => {
  it("renders the not-found heading and a back button", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("heading", { name: /not found/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /back/i }))
      .toBeInTheDocument();
  });
});
