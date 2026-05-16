import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/ready.stories";

describe("<Ready />", () => {
  it("renders the welcome heading and helper links", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("heading", { name: /welcome to shadcn-admin-kit/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /documentation/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /github/i }))
      .toBeInTheDocument();
  });
});
