import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  Label,
  HelperText,
} from "@/stories/admin/checkbox-group-input.stories";

describe("<CheckboxGroupInput />", () => {
  it("renders one checkbox per choice", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByLabelText(/^tech$/i))
      .toBeInTheDocument();
    await expect
      .element(screen.getByLabelText(/^lifestyle$/i))
      .toBeInTheDocument();
    await expect
      .element(screen.getByLabelText(/^people$/i))
      .toBeInTheDocument();
  });

  it("marks the boxes matching the initial value as checked", async () => {
    const screen = render(<Basic />);
    // record.tags = ["lifestyle"]
    await expect.element(screen.getByLabelText(/^lifestyle$/i)).toBeChecked();
    await expect.element(screen.getByLabelText(/^tech$/i)).not.toBeChecked();
  });

  it("disables every choice when disabled is set", async () => {
    const screen = render(<Disabled />);
    await expect.element(screen.getByLabelText(/^tech$/i)).toBeDisabled();
    await expect
      .element(screen.getByLabelText(/^lifestyle$/i))
      .toBeDisabled();
  });

  it("renders the explicit label when provided", async () => {
    const screen = render(<Label />);
    await expect
      .element(screen.getByText(/pick your interests/i))
      .toBeInTheDocument();
  });

  it("renders helper text when helperText is provided", async () => {
    const screen = render(<HelperText />);
    await expect
      .element(screen.getByText(/choose one or more topics/i))
      .toBeInTheDocument();
  });
});
