import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./device-test-wrapper.stories";

describe("<DeviceTestWrapper />", () => {
  it("renders its children at the requested simulated width", async () => {
    const screen = render(<Basic theme="system" width="md" />);
    await expect
      .element(screen.getByText(/simulated width/i))
      .toBeInTheDocument();
  });
});
