import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/infinite-pagination.stories";

describe("<InfinitePagination />", () => {
  it("displays the first page of records", async () => {
    const screen = render(<Basic />);
    await expect
      .poll(() => screen.getByText("Book #1").elements().length, { timeout: 5000 })
      .toBeGreaterThan(0);
  });

  it("eventually loads subsequent pages via the IntersectionObserver", async () => {
    const screen = render(<Basic />);
    // The component uses an IntersectionObserver to auto-fetch additional
    // pages as the sentinel scrolls into view. In the test environment the
    // sentinel is observable immediately, so we should eventually see records
    // beyond page 1 (perPage 10 -> Book #11+).
    await expect
      .poll(() => screen.getByText("Book #11").elements().length, {
        timeout: 10000,
      })
      .toBeGreaterThan(0);
  }, 15000);
});
