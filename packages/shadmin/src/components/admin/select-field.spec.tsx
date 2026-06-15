import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./select-field.stories";

describe("<SelectField />", () => {
  it("renders the label of the matching choice", async () => {
    const screen = render(<Basic />);
    // The story sets gender = "male", whose label is "He/Him"
    await expect.element(screen.getByText("He/Him")).toBeInTheDocument();
  });
});
