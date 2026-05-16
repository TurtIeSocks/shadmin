import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Disabled } from "@/stories/extras/api-key-input.stories";

describe("<ApiKeyInput />", () => {
  it("renders a rotate button labelled with the source name", async () => {
    const screen = render(<Basic />);
    const btn = screen.container.querySelector(
      "[data-rotate-button]",
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.textContent ?? "").toMatch(/rotate/i);
  });

  it("opens a confirmation dialog when rotate is clicked", async () => {
    const screen = render(<Basic />);
    const btn = screen.container.querySelector(
      "[data-rotate-button]",
    ) as HTMLButtonElement;
    btn.click();
    await expect.element(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    const btn = screen.container.querySelector(
      "[data-rotate-button]",
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
