import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  Empty,
  Label,
  ClearAlwaysVisible,
} from "@/stories/admin/resettable-text-input.stories";

describe("<ResettableTextInput />", () => {
  it("renders a text input with the humanized field label", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
  });

  it("shows a clear button when the field has a value", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /clear value/i }))
      .toBeInTheDocument();
  });

  it("hides the clear button when the field is empty", async () => {
    const screen = render(<Empty />);
    await expect
      .element(screen.getByRole("button", { name: /clear value/i }))
      .not.toBeInTheDocument();
  });

  it("clears the input value when the clear button is clicked", async () => {
    const screen = render(<Basic />);
    const input = screen.getByLabelText(/^title$/i);
    await expect.element(input).toHaveValue("War and Peace");
    await screen.getByRole("button", { name: /clear value/i }).click();
    await expect.element(input).toHaveValue("");
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    await expect.element(screen.getByLabelText(/^title$/i)).toBeDisabled();
  });

  it("renders the explicit label when provided", async () => {
    const screen = render(<Label />);
    await expect
      .element(screen.getByLabelText(/^product name$/i))
      .toBeInTheDocument();
  });

  it("keeps the clear button visible when clearAlwaysVisible is set", async () => {
    const screen = render(<ClearAlwaysVisible />);
    await expect
      .element(screen.getByRole("button", { name: /clear value/i }))
      .toBeInTheDocument();
  });
});
