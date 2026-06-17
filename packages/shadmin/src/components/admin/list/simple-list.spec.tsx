import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  WithTertiaryText,
} from "@/components/admin/list/simple-list.stories";

describe("<SimpleList />", () => {
  it("renders the primary and secondary text for each record", async () => {
    const screen = render(<Basic />);
    // Wait for the records to load (5 books in the fake provider).
    await expect
      .poll(() => screen.getByRole("listitem").all().length, { timeout: 5000 })
      .toBeGreaterThan(0);
    // primaryText returns record.title; secondaryText returns record.author.
    await expect.element(screen.getByText("Leo Tolstoy")).toBeInTheDocument();
    await expect.element(screen.getByText("Jane Austen")).toBeInTheDocument();
  });

  it("renders the tertiary text slot when configured", async () => {
    const screen = render(<WithTertiaryText />);
    await expect
      .poll(() => screen.getByRole("listitem").all().length, { timeout: 5000 })
      .toBeGreaterThan(0);
    // tertiaryText returns record.year — assert one of the known years renders.
    await expect.element(screen.getByText("1869")).toBeInTheDocument();
  });
});
