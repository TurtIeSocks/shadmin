import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  Label,
  HelperText,
} from "./radio-button-group-input.stories";

describe("<RadioButtonGroupInput />", () => {
  it("renders one radio per choice", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("radio", { name: /^tech$/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("radio", { name: /^lifestyle$/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("radio", { name: /^people$/i }))
      .toBeInTheDocument();
  });

  it("marks the radio matching the initial value as checked", async () => {
    const screen = render(<Basic />);
    // record.category = "lifestyle"
    await expect
      .element(screen.getByRole("radio", { name: /^lifestyle$/i }))
      .toBeChecked();
  });

  it("disables every radio when disabled is set", async () => {
    const screen = render(<Disabled />);
    await expect
      .element(screen.getByRole("radio", { name: /^tech$/i }))
      .toBeDisabled();
  });

  it("renders the explicit label when provided", async () => {
    const screen = render(<Label />);
    await expect
      .element(screen.getByText(/select category/i).first())
      .toBeInTheDocument();
  });

  it("renders helper text when provided", async () => {
    const screen = render(<HelperText />);
    await expect
      .element(screen.getByText(/select category/i).first())
      .toBeInTheDocument();
  });
});
