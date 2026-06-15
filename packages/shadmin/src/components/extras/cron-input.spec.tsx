import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Disabled, Empty } from "./cron-input.stories";

describe("<CronInput />", () => {
  it("renders a text input bound to source with human-phrase preview", async () => {
    const screen = render(<Basic />);
    const input = screen.container.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe("0 9 * * 1-5");
    await expect.element(screen.getByText(/09:00/i)).toBeInTheDocument();
  });

  it("disables the input when disabled prop is set", async () => {
    const screen = render(<Disabled />);
    const input = screen.container.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("renders an empty preview slot when value is empty", async () => {
    const screen = render(<Empty />);
    const preview = screen.container.querySelector(
      "[data-cron-preview]",
    ) as HTMLElement;
    expect(preview).toBeTruthy();
    expect(preview.textContent ?? "").toBe("");
  });
});
