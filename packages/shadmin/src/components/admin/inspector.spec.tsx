import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./inspector.stories";

describe("<Inspector />", () => {
  it("renders the configurable content but not the inspector panel by default", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText("Edit me from the inspector").first())
      .toBeInTheDocument();
    await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
  });
});
