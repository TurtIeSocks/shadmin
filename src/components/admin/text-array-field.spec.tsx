import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Empty } from "@/stories/admin/text-array-field.stories";

describe("<TextArrayField />", () => {
  it("renders each array value as a badge", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText("Fiction", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Historical Fiction"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Russian Literature"))
      .toBeInTheDocument();
  });

  it("renders the empty placeholder when the array is empty", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("No genres")).toBeInTheDocument();
  });
});
