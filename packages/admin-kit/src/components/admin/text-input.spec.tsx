import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Disabled } from "./text-input.stories";

describe("<TextInput />", () => {
  it("renders an input pre-filled from the record context", async () => {
    const screen = render(<Basic />);
    const input = screen.getByRole("textbox");
    await expect.element(input).toBeInTheDocument();
    await expect.element(input).toHaveValue("Apple");
  });

  it("renders a disabled input when `disabled` is passed", async () => {
    const screen = render(<Disabled />);
    const input = screen.getByRole("textbox");
    await expect.element(input).toBeDisabled();
  });
});
