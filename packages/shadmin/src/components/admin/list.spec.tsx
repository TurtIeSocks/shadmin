import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, CustomPerPage } from "./list.stories";

describe("<List />", () => {
  it("renders the resource title and the records returned by the data provider", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("heading", { name: "Posts" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("cell", { name: "Post #1", exact: true }))
      .toBeInTheDocument();
  });

  it("respects the perPage prop in the pagination footer", async () => {
    const screen = render(<CustomPerPage />);
    // perPage=5 + 23 total → 5 visible rows + a "1-5 of 23" range.
    await expect
      .element(screen.getByText(/1\s*[-–]\s*5\s+of\s+23/i))
      .toBeInTheDocument();
  });
});
