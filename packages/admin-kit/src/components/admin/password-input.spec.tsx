import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  InitiallyVisible,
} from "./password-input.stories";

describe("<PasswordInput />", () => {
  it("renders a masked password input with the humanized field label", async () => {
    const screen = render(<Basic />);
    const input = screen.getByLabelText(/^password$/i);
    await expect.element(input).toBeInTheDocument();
    await expect.element(input).toHaveAttribute("type", "password");
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    await expect.element(screen.getByLabelText(/^password$/i)).toBeDisabled();
  });

  it("renders the value in plain text when initiallyVisible is set", async () => {
    const screen = render(<InitiallyVisible />);
    await expect
      .element(screen.getByLabelText(/^password$/i))
      .toHaveAttribute("type", "text");
  });

  it("toggles visibility when the eye button is clicked", async () => {
    const screen = render(<Basic />);
    const toggle = screen.getByRole("button", { name: /show password/i });
    await toggle.click();
    await expect
      .element(screen.getByLabelText(/^password$/i))
      .toHaveAttribute("type", "text");
  });
});
