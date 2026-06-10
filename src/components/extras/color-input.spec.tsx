import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  WithSwatches,
} from "./color-input.stories";

describe("<ColorInput />", () => {
  it("renders a color picker trigger bound to the source value", async () => {
    const screen = render(<Basic />);
    const trigger = screen.container.querySelector<HTMLButtonElement>(
      '[data-slot="color-picker-trigger"]',
    );
    expect(trigger).toBeTruthy();
    // The trigger renders an inline swatch span whose background is the
    // current color value. Use it as a proxy for "input bound to source".
    const swatch = trigger?.querySelector<HTMLElement>("span[aria-hidden]");
    expect(swatch?.style.backgroundColor).toBeTruthy();
    await expect.element(screen.getByText(/^color$/i)).toBeInTheDocument();
  });

  it("renders swatch buttons when swatches prop is set", async () => {
    const screen = render(<WithSwatches />);
    const swatches = screen.container.querySelectorAll("[data-color-swatch]");
    expect(swatches.length).toBe(6);
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    // `<fieldset disabled>` cascades `disabled` to every form control inside,
    // so the trigger button reports `disabled=true`.
    const fieldset =
      screen.container.querySelector<HTMLFieldSetElement>("fieldset");
    expect(fieldset?.disabled).toBe(true);
    // `HTMLButtonElement.disabled` mirrors the attribute, not the cascaded
    // `<fieldset disabled>` state, so use `:disabled` (which the CSS selector
    // engine resolves against the fieldset chain).
    const trigger = screen.container.querySelector<HTMLButtonElement>(
      '[data-slot="color-picker-trigger"]',
    );
    expect(trigger?.matches(":disabled")).toBe(true);
  });
});
