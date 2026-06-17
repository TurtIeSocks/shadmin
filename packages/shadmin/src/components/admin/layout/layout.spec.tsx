import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, ErrorState } from "@/components/admin/layout/layout.stories";

describe("<Layout />", () => {
  it("renders the children inside the layout", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders the error fallback when a child throws", async () => {
    const screen = render(<ErrorState />);
    await expect.element(screen.getByRole("alert")).toBeInTheDocument();
  });
});
