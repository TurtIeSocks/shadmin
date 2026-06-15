import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, WithValidation } from "./reference-array-input.stories";

describe("<ReferenceArrayInput />", () => {
  it("renders the embedded input with reference choices", async () => {
    const screen = render(<Basic />);
    const combobox = screen.getByRole("combobox");
    await expect.element(combobox).toBeInTheDocument();
  });

  it("surfaces validation errors from the child input", async () => {
    const screen = render(<WithValidation />);
    const submit = screen.getByRole("button", { name: /save/i });
    await submit.click();
    await expect.element(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
