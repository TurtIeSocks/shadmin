import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  NoExport,
  NoThemeToggle,
} from "./theme-studio.stories";

describe("<ThemeStudio />", () => {
  it("renders one row per CSS variable in the theme's light map", async () => {
    const screen = render(<Basic />);
    const rows = screen.container.querySelectorAll("[data-theme-var]");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("renders the export button by default", async () => {
    const screen = render(<Basic />);
    const btn = screen.container.querySelector("[data-theme-export]");
    expect(btn).toBeTruthy();
  });

  it("hides the export button when showExport=false", async () => {
    const screen = render(<NoExport />);
    expect(screen.container.querySelector("[data-theme-export]")).toBeNull();
  });

  it("hides the theme mode toggle button when showThemeModeToggle=false", async () => {
    const screen = render(<NoThemeToggle />);
    expect(
      screen.container.querySelector("[data-theme-mode-toggle]"),
    ).toBeNull();
  });

  it("swaps the active palette when the mode toggle is used", async () => {
    const screen = render(<Basic />);

    await screen.getByRole("button", { name: /toggle.*(theme|mode)/i }).click();
    await screen.getByRole("menuitem", { name: "Dark" }).click();

    await expect
      .poll(() => document.documentElement.classList.contains("dark"))
      .toBe(true);
    expect(
      document.documentElement.style.getPropertyValue("--background"),
    ).toBe("oklch(0.145 0 0)");

    await screen.getByRole("button", { name: /toggle.*(theme|mode)/i }).click();
    await screen.getByRole("menuitem", { name: "Light" }).click();

    await expect
      .poll(() => document.documentElement.classList.contains("light"))
      .toBe(true);
    expect(
      document.documentElement.style.getPropertyValue("--background"),
    ).toBe("oklch(1 0 0)");
  });

  it("routes ColorInput edits through the provider's live var state", async () => {
    const screen = render(<Basic />);

    await screen.getByRole("button", { name: /toggle.*(theme|mode)/i }).click();
    await screen.getByRole("menuitem", { name: "Light" }).click();
    await expect
      .poll(() => document.documentElement.classList.contains("light"))
      .toBe(true);

    const textInput = screen.container.querySelector<HTMLInputElement>(
      '[data-theme-var="--background"] input[type="text"]',
    );
    if (!textInput) throw new Error("text input for --background not found");

    // React tracks the previous value via a hidden `_valueTracker` so it can
    // detect changes. Mutating `.value` directly bypasses that, so React's
    // synthetic `onChange` doesn't fire. Use the native prototype setter to
    // sync the tracker, then dispatch a bubbling `input` event.
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(textInput, "oklch(0.5 0 0)");
    textInput.dispatchEvent(new Event("input", { bubbles: true }));

    await expect
      .poll(() =>
        document.documentElement.style.getPropertyValue("--background"),
      )
      .toBe("oklch(0.5 0 0)");
  });

  it("opens an oklch picker popover when the swatch is clicked", async () => {
    const screen = render(<Basic />);

    await screen.getByRole("button", { name: /toggle.*(theme|mode)/i }).click();
    await screen.getByRole("menuitem", { name: "Light" }).click();
    await expect
      .poll(() => document.documentElement.classList.contains("light"))
      .toBe(true);

    await screen
      .getByRole("button", { name: "Open color picker for --background" })
      .click();

    await expect
      .poll(() => document.querySelector('[data-slot="color-picker"]'))
      .not.toBeNull();
    expect(
      document.querySelector('[data-slot="color-picker-pad"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-slot="color-picker-hue"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-slot="color-picker-alpha"]'),
    ).toBeTruthy();
  });

  it("appends an alpha suffix to the var when the Alpha slider is moved", async () => {
    const screen = render(<Basic />);

    await screen.getByRole("button", { name: /toggle.*(theme|mode)/i }).click();
    await screen.getByRole("menuitem", { name: "Light" }).click();
    await expect
      .poll(() => document.documentElement.classList.contains("light"))
      .toBe(true);

    await screen
      .getByRole("button", { name: "Open color picker for --background" })
      .click();

    const alphaStrip = document.querySelector<HTMLElement>(
      '[data-slot="color-picker-alpha"]',
    );
    if (!alphaStrip) throw new Error("alpha strip not found");

    // Click at 30% along the strip => alpha ~= 0.30.
    const rect = alphaStrip.getBoundingClientRect();
    const targetX = rect.left + rect.width * 0.3;
    const targetY = rect.top + rect.height / 2;
    alphaStrip.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientX: targetX,
        clientY: targetY,
        pointerType: "mouse",
        isPrimary: true,
        pointerId: 1,
      }),
    );

    await expect
      .poll(() =>
        document.documentElement.style.getPropertyValue("--background"),
      )
      .toMatch(/\/ 30%\)$/);
  });
});
