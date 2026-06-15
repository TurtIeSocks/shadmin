import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { NoFilters, WithFilters } from "./list-no-results.stories";

describe("<ListNoResults />", () => {
  it("renders the no-results message when no filters are active", async () => {
    const screen = render(<NoFilters />);
    await expect
      .element(screen.getByText(/no posts found/i))
      .toBeInTheDocument();
  });

  it("renders a clear-filters action when filters are active", async () => {
    const screen = render(<WithFilters />);
    await expect
      .element(screen.getByRole("button", { name: /clear filters/i }))
      .toBeInTheDocument();
  });
});
