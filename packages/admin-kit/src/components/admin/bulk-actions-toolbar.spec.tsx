import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomChildren,
  Empty,
} from "./bulk-actions-toolbar.stories";

describe("<BulkActionsToolbar />", () => {
  it("renders a count of selected rows", async () => {
    const screen = render(<Basic />);
    // Story selects ids [1, 2] -> default i18n: "2 items selected".
    await expect
      .element(screen.getByText(/2 items selected/i))
      .toBeInTheDocument();
  });

  it("renders custom children when provided", async () => {
    const screen = render(<CustomChildren />);
    // BulkDeleteButton is the only custom action; should render a Delete button.
    await expect
      .element(screen.getByRole("button", { name: /delete/i }))
      .toBeInTheDocument();
  });

  it("renders nothing when no rows are selected", async () => {
    const screen = render(<Empty />);
    // The Unselect button only renders when selected; ensure it's absent.
    await expect
      .element(screen.getByRole("button", { name: /unselect/i }))
      .not.toBeInTheDocument();
  });
});
