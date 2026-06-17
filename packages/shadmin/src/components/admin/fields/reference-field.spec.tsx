import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  WithLink,
} from "@/components/admin/fields/reference-field.stories";

describe("<ReferenceField />", () => {
  it("renders the referenced record's representation once loaded", async () => {
    const screen = render(<Basic />);
    // Authors: Jane Doe (id 1) and John Smith (id 2)
    await expect
      .poll(() => screen.getByText("Jane Doe").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
    await expect.element(screen.getByText("John Smith")).toBeInTheDocument();
  });

  it("wraps the value in a link when the link prop is set", async () => {
    const screen = render(<WithLink />);
    await expect
      .poll(
        () => screen.getByRole("link", { name: "Jane Doe" }).elements().length,
        { timeout: 5000 },
      )
      .toBeGreaterThan(0);
  });
});
