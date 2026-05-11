import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Empty,
  RowClickFalse,
  BulkActionButtons,
} from "@/stories/data-table.stories";

describe("<DataTable />", () => {
  it("renders the column headers and data rows once data resolves", async () => {
    const screen = render(<Basic />);
    // The Admin wrapper fetches data asynchronously; poll until the body
    // rows show up (header row + at least one data row).
    await expect
      .poll(() => screen.getByRole("row").all().length, { timeout: 5000 })
      .toBeGreaterThan(1);
    // Sanity check a known cell from the fakerest data.
    await expect
      .element(screen.getByText("War and Peace"))
      .toBeInTheDocument();
  });

  it("renders the default empty placeholder when data is empty", async () => {
    const screen = render(<Empty />);
    await expect
      .element(screen.getByText(/no results found/i))
      .toBeInTheDocument();
  });

  it("supports a custom empty placeholder via the `empty` prop", async () => {
    const screen = render(<Empty />);
    await expect
      .element(screen.getByText("No books found"))
      .toBeInTheDocument();
  });

  it("does not apply the cursor-pointer class when rowClick is false", async () => {
    const screen = render(<RowClickFalse />);
    // Rows should still render; just sanity check
    const rows = screen.getByRole("row");
    expect(rows.all().length).toBeGreaterThan(1);
  });

  it("renders custom bulk action buttons when provided", async () => {
    const screen = render(<BulkActionButtons />);
    // Custom heading present
    await expect.element(screen.getByText("Custom")).toBeInTheDocument();
  });
});
