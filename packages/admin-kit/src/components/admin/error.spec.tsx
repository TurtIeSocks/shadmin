import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./error.stories";

describe("<Error />", () => {
  it("renders the error heading and a back button", async () => {
    const screen = render(<Basic theme="system" />);
    await expect.element(screen.getByRole("alert")).toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /back/i }))
      .toBeInTheDocument();
  });
});
