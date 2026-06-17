import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/components/admin/guessers/edit-guesser.stories";

describe("<EditGuesser />", () => {
  it("guesses inputs from the record shape and renders editable fields", async () => {
    const screen = render(<Basic />);
    // Once the record loads, the guesser infers <TextInput> for the string
    // columns of the customer record. Field labels are humanized from the
    // source (e.g. `first_name` → "First name").
    await expect
      .poll(() => screen.getByText("First name").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
    await expect.element(screen.getByText("Last name")).toBeInTheDocument();
    await expect.element(screen.getByText("Email")).toBeInTheDocument();
  });

  it("populates inputs with the loaded record values", async () => {
    const screen = render(<Basic />);
    await expect
      .poll(() => screen.getByText("First name").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
    const firstName = screen.getByLabelText("First name");
    await expect.element(firstName).toHaveValue("Jane");
  });
});
