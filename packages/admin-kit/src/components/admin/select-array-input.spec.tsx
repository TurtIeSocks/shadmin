import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  Label,
} from "./select-array-input.stories";

describe("<SelectArrayInput />", () => {
  it("renders a combobox trigger and shows the initially-selected choices", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByRole("combobox")).toBeInTheDocument();
    // record.tags = ["tech"] → "Tech" badge should be in the trigger.
    await expect.element(screen.getByText(/^tech$/i)).toBeInTheDocument();
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    await expect.element(screen.getByRole("combobox")).toBeDisabled();
  });

  it("renders the explicit label when provided", async () => {
    const screen = render(<Label />);
    await expect
      .element(screen.getByText(/pick tags/i).first())
      .toBeInTheDocument();
  });
});
