import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/hide-on-scroll.stories";

describe("<HideOnScroll />", () => {
  it("renders its header child by default", async () => {
    const screen = render(<Basic theme="system" />);
    await expect
      .element(screen.getByText(/header — hidden on scroll down/i))
      .toBeInTheDocument();
  });
});
