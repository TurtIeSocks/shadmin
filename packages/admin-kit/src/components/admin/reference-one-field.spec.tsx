import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, WithRenderProp } from "./reference-one-field.stories";

describe("<ReferenceOneField />", () => {
  it("renders the related record's referenced value once loaded", async () => {
    const screen = render(<Basic />);
    // The bio body for author #1
    await expect
      .poll(
        () =>
          screen.getByText(/Irish novelist, short story writer/i).elements()
            .length,
        { timeout: 5000 },
      )
      .toBeGreaterThan(0);
  });

  it("invokes the render prop with the referenced record", async () => {
    const screen = render(<WithRenderProp />);
    await expect
      .poll(
        () =>
          screen.getByText(/Irish novelist, short story writer/i).elements()
            .length,
        { timeout: 5000 },
      )
      .toBeGreaterThan(0);
  });
});
