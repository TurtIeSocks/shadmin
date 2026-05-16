import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  ColorOnly,
  NoExport,
} from "@/stories/extras/theme-studio.stories";

describe("<ThemeStudio />", () => {
  it("renders one row per CSS variable in the theme's light map", async () => {
    const screen = render(<Basic />);
    const rows = screen.container.querySelectorAll("[data-theme-var]");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("filters to color-only when filter='color'", async () => {
    const screen = render(<ColorOnly />);
    const rows = screen.container.querySelectorAll("[data-theme-var]");
    expect(rows.length).toBeGreaterThan(0);
    Array.from(rows).forEach((row) => {
      const val = row.getAttribute("data-value") ?? "";
      expect(/oklch\(|#[0-9a-f]{3,8}|rgb|hsl/i.test(val) || val === "").toBe(
        true,
      );
    });
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
});
