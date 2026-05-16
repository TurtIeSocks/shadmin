import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Empty, Oklch } from "@/stories/admin/color-field.stories";

describe("<ColorField />", () => {
  it("renders a chip whose background matches the hex value", async () => {
    const screen = render(<Basic />);
    const chip = screen.container.querySelector(
      "[data-color-chip]",
    ) as HTMLElement;
    expect(chip).toBeTruthy();
    expect(chip.style.backgroundColor).toBe("rgb(59, 130, 246)");
    await expect.element(screen.getByText("#3b82f6")).toBeInTheDocument();
  });

  it("renders an oklch value as label text", async () => {
    const screen = render(<Oklch />);
    await expect.element(screen.getByText(/oklch/i)).toBeInTheDocument();
  });

  it("renders empty fallback when value is null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("No color")).toBeInTheDocument();
  });
});
