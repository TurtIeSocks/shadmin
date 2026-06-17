import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  DisableAdd,
  DisableRemove,
} from "@/components/admin/form/simple-form-iterator.stories";

describe("<SimpleFormIterator />", () => {
  it("renders one row per existing item plus an Add button", async () => {
    const screen = render(<Basic />);
    // record.tags = [{name:"react"},{name:"typescript"}] → 2 text inputs
    // with those initial values.
    const textboxes = screen.getByRole("textbox");
    expect(textboxes.all().length).toBe(2);
    await expect.element(textboxes.first()).toHaveValue("react");
    await expect.element(textboxes.nth(1)).toHaveValue("typescript");
    const addButton = screen.container.querySelector(".button-add");
    expect(addButton).toBeTruthy();
  });

  it("renders one remove button per row by default", async () => {
    const screen = render(<Basic />);
    const removeButtons = screen.container.querySelectorAll(".button-remove");
    expect(removeButtons.length).toBe(2);
  });

  it("hides the Add button when disableAdd is set", async () => {
    const screen = render(<DisableAdd />);
    const addButton = screen.container.querySelector(".button-add");
    expect(addButton).toBeNull();
  });

  it("hides the remove buttons when disableRemove is set", async () => {
    const screen = render(<DisableRemove />);
    const removeButtons = screen.container.querySelectorAll(".button-remove");
    expect(removeButtons.length).toBe(0);
  });
});
