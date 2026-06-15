import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, MultipleResources } from "./resource.stories";

describe("<Resource />", () => {
  it("mounts the list view at the resource's route", async () => {
    const screen = render(<Basic />);
    await expect
      .poll(() => screen.getByText("Hello world").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
  });

  it("supports multiple resources", async () => {
    const screen = render(<MultipleResources />);
    // /posts is the active route; both resources should at least be configured.
    await expect
      .poll(() => screen.getByText("Hello world").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
  });
});
