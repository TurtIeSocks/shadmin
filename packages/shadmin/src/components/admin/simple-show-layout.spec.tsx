import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, CustomClassName } from "./simple-show-layout.stories";

describe("<SimpleShowLayout />", () => {
  it("renders each child field with the record's data", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Hello world")).toBeInTheDocument();
    await expect.element(screen.getByText("Jane Doe")).toBeInTheDocument();
    await expect.element(screen.getByText("123")).toBeInTheDocument();
  });

  it("applies the custom className when provided", async () => {
    const { container } = render(<CustomClassName />);
    // The layout root receives the classes.
    const layout = container.querySelector('[class*="bg-muted"]');
    expect(layout).toBeTruthy();
    expect(layout?.className).toContain("gap-8");
  });
});
