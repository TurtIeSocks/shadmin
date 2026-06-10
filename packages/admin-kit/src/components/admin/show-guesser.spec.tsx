import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./show-guesser.stories";

describe("<ShowGuesser />", () => {
  it("guesses fields from the record shape and renders their values", async () => {
    const screen = render(<Basic />);
    // Once the record loads, the guesser infers fields for each scalar column
    // of the customer record. Use unique values to avoid strict-mode collisions
    // ("Jane" also appears inside "jane@example.com").
    await expect
      .poll(() => screen.getByText("jane@example.com").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
    await expect.element(screen.getByText("Doe")).toBeInTheDocument();
  });
});
