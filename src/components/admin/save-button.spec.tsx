import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Default,
  Disabled,
  CustomLabel,
  DisabledWhenPristine,
} from "./save-button.stories";

describe("<SaveButton />", () => {
  it("renders a Save button by default", async () => {
    const screen = render(<Default />);
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeInTheDocument();
  });

  it("is enabled by default (always-enabled UX)", async () => {
    const screen = render(<Default />);
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeEnabled();
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeDisabled();
  });

  it("renders custom labels when provided", async () => {
    const screen = render(<CustomLabel />);
    await expect
      .element(screen.getByRole("button", { name: /save changes/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /save draft/i }))
      .toBeInTheDocument();
  });

  it("can be made disabled-when-pristine via useFormState", async () => {
    const screen = render(<DisabledWhenPristine />);
    // Form is initially pristine, so the Save button should be disabled.
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeDisabled();
  });
});
