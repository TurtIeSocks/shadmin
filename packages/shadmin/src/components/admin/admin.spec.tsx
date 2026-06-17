import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomTitle,
  WithTheme,
} from "@/components/admin/admin.stories";

describe("<Admin />", () => {
  it("renders the resource's list view at its route", async () => {
    const screen = render(<Basic />);
    // The Basic story navigates to /posts; the ListGuesser eventually renders
    // the posts content (e.g. "Hello world").
    await expect
      .poll(() => screen.getByText("Hello world").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
  });

  it("accepts a custom title without crashing the resource view", async () => {
    // The `title` prop is consumed by views via DefaultTitleContext (not
    // document.title). Just ensure the resource still renders end-to-end.
    const screen = render(<CustomTitle />);
    await expect
      .poll(() => screen.getByText("Hello world").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
  });

  it("renders with a custom theme", async () => {
    const screen = render(<WithTheme />);
    // Theme story still loads the posts route; ensure the data eventually arrives.
    await expect
      .poll(() => screen.getByText("Hello world").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
  });
});
