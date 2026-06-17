import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  FewItems,
} from "@/components/admin/list/list-pagination.stories";

describe("<ListPagination />", () => {
  it("renders the page-range info for the current page", async () => {
    const screen = render(<Basic />);
    // 87 records, perPage 10 -> first page renders "1-10 of 87".
    await expect
      .poll(() => screen.getByText(/1-10 of 87/).elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
  });

  it("renders previous/next navigation buttons", async () => {
    const screen = render(<Basic />);
    await expect
      .poll(
        () =>
          screen.getByRole("button", { name: /previous/i }).elements().length,
        { timeout: 5000 },
      )
      .toBeGreaterThan(0);
    await expect
      .element(screen.getByRole("button", { name: /next/i }))
      .toBeInTheDocument();
  });

  it("renders a range-info reflecting a higher perPage", async () => {
    const screen = render(<FewItems />);
    // 87 records, perPage 50 -> first page renders "1-50 of 87".
    await expect
      .poll(() => screen.getByText(/1-50 of 87/).elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
  });
});
