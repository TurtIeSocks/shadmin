import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { Free } from "./lock-on-mount.stories";

describe("<LockOnMount>", () => {
  it("renders the protected children after lock acquisition", async () => {
    const screen = render(<Free />);
    await expect.element(screen.getByTestId("protected")).toBeVisible();
  });
});
