import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/components/admin/views/card-content-inner.stories";

describe("<CardContentInner />", () => {
  it("renders the section headings stacked inside a single card", async () => {
    const screen = render(<Basic theme="system" />);
    await expect.element(screen.getByText("First section")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Second section"))
      .toBeInTheDocument();
    await expect.element(screen.getByText("Third section")).toBeInTheDocument();
  });
});
