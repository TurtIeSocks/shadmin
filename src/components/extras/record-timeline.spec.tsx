import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ExplicitEntries, FromReference } from "@/stories/record-timeline.stories";

describe("<RecordTimeline />", () => {
  it("renders entries from the entries prop", async () => {
    const screen = render(<ExplicitEntries />);
    await expect.element(screen.getByText(/created/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/updated price/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/deleted entry/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/alice/i)).toBeInTheDocument();
  });

  it("renders entries from a reference-many data source", async () => {
    const screen = render(<FromReference />);
    await expect
      .element(screen.getByText(/created product/i))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/updated price to \$19\.99/i))
      .toBeInTheDocument();
  });
});
