import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  WithSwatches,
} from "@/stories/admin/color-input.stories";

describe("<ColorInput />", () => {
  it("renders a color input bound to source", async () => {
    const screen = render(<Basic />);
    const input = screen.container.querySelector(
      "input[type='color']",
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe("#3b82f6");
    await expect.element(screen.getByText(/^color$/i)).toBeInTheDocument();
  });

  it("renders swatch buttons when swatches prop is set", async () => {
    const screen = render(<WithSwatches />);
    const swatches = screen.container.querySelectorAll("[data-color-swatch]");
    expect(swatches.length).toBe(6);
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    const input = screen.container.querySelector(
      "input[type='color']",
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
