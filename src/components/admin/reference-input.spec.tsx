import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, WithValidation } from "@/stories/admin/reference-input.stories";

describe("<ReferenceInput />", () => {
  it("renders the autocomplete combobox for the reference field", async () => {
    const screen = render(<Basic />);
    await expect
      .poll(() => screen.getByRole("combobox").all().length, { timeout: 2000 })
      .toBeGreaterThan(0);
  });

  it("surfaces validation errors from the child input", async () => {
    const screen = render(<WithValidation />);
    const submit = screen.getByRole("button", { name: /save/i });
    await expect.element(submit).toBeInTheDocument();
    await submit.click();
    await expect.element(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
