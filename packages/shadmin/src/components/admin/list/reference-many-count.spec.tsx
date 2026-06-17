import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/components/admin/list/reference-many-count.stories";

describe("<ReferenceManyCount />", () => {
  it("renders the count of related records for each row", async () => {
    const screen = render(<Basic />);
    // Jane Doe has 3 books, John Smith has 2, Alice Johnson has 0.
    // The counts render as plain <span>{N}</span> inside table cells.
    await expect
      .poll(() => screen.getByText("3", { exact: true }).elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
    await expect
      .element(screen.getByText("2", { exact: true }).first())
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("0", { exact: true }))
      .toBeInTheDocument();
  });
});
