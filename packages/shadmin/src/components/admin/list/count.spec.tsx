import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  WithFilter,
  AsLink,
} from "@/components/admin/list/count.stories";

describe("<Count />", () => {
  it("renders the total number of records for the resource", async () => {
    const screen = render(<Basic />);
    // The fake provider seeds 3 posts.
    await expect
      .poll(() => screen.getByText("3").elements().length, { timeout: 5000 })
      .toBeGreaterThan(0);
  });

  it("respects the filter prop", async () => {
    const screen = render(<WithFilter />);
    // Only 2 posts are published.
    await expect
      .poll(() => screen.getByText("2").elements().length, { timeout: 5000 })
      .toBeGreaterThan(0);
  });

  it("renders as a link when the link prop is set", async () => {
    const screen = render(<AsLink />);
    // The Link element wraps the count; once loaded, an anchor should be visible.
    await expect
      .poll(() => screen.getByRole("link").elements().length, { timeout: 5000 })
      .toBeGreaterThan(0);
  });
});
