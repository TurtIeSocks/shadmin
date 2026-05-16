import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  NoSelection,
} from "@/stories/extras/bulk-edit-drawer.stories";

describe("<BulkEditDrawer />", () => {
  it("renders a trigger button with the supplied label", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Edit selected")).toBeInTheDocument();
  });

  it("disables the trigger when disabled prop is set", async () => {
    const screen = render(<Disabled />);
    const button = screen.container.querySelector(
      "[data-bulk-edit-trigger]",
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("disables the trigger when no rows are selected", async () => {
    const screen = render(<NoSelection />);
    const button = screen.container.querySelector(
      "[data-bulk-edit-trigger]",
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("opens a sheet containing the form children on click", async () => {
    const screen = render(<Basic />);
    const button = screen.container.querySelector(
      "[data-bulk-edit-trigger]",
    ) as HTMLButtonElement;
    button.click();
    // Sheet renders into a portal; query the document for the form fields
    await expect
      .element(screen.getByLabelText(/^category$/i))
      .toBeInTheDocument();
    await expect.element(screen.getByLabelText(/^price$/i)).toBeInTheDocument();
  });
});
