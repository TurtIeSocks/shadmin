import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, NoExport, NoThemeToggle } from "./theme-studio.stories";

describe("<ThemeStudio />", () => {
  it("renders one row per editable CSS variable", async () => {
    const screen = render(<Basic />);
    const rows = screen.container.querySelectorAll("[data-theme-var]");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("renders the export button by default", async () => {
    const screen = render(<Basic />);
    expect(screen.container.querySelector("[data-theme-export]")).toBeTruthy();
  });

  it("hides the export button when showExport=false", async () => {
    const screen = render(<NoExport />);
    expect(screen.container.querySelector("[data-theme-export]")).toBeNull();
  });

  it("hides the theme mode toggle when showThemeModeToggle=false", async () => {
    const screen = render(<NoThemeToggle />);
    expect(
      screen.container.querySelector("[data-theme-mode-toggle]"),
    ).toBeNull();
  });

  it("toggles the .dark class via the mode toggle", async () => {
    const screen = render(<Basic />);

    await screen.getByRole("button", { name: /toggle.*(theme|mode)/i }).click();
    await screen.getByRole("menuitem", { name: "Dark" }).click();
    await expect
      .poll(() => document.documentElement.classList.contains("dark"))
      .toBe(true);

    await screen.getByRole("button", { name: /toggle.*(theme|mode)/i }).click();
    await screen.getByRole("menuitem", { name: "Light" }).click();
    await expect
      .poll(() => document.documentElement.classList.contains("light"))
      .toBe(true);
  });

  it("writes ColorInput edits to the document root inline style", async () => {
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

    await screen
      .getByRole("button", { name: "Open color picker for --background" })
      .click();

    await expect
      .poll(() => document.querySelector('[data-slot="color-picker"]'))
      .not.toBeNull();
    expect(
      document.querySelector('[data-slot="color-picker-pad"]'),
    ).toBeTruthy();
  });
});
