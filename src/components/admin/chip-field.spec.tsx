import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Secondary, Empty } from "@/stories/admin/chip-field.stories";

describe("<ChipField />", () => {
  it("renders the source value inside a chip", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("renders the secondary variant", async () => {
    const screen = render(<Secondary />);
    await expect.element(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("renders the empty placeholder when the value is missing", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("No status")).toBeInTheDocument();
  });
});
