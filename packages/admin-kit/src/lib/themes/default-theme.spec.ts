import { describe, expect, it } from "vitest";

import indexCss from "@/index.css?raw";
import { defaultTheme } from "./default-theme";

/**
 * `defaultTheme` (in TypeScript) and the `:root` / `.dark` blocks in
 * `src/index.css` describe the same palette in two different formats. The CSS
 * blocks serve as the static baseline before JS boots; the TypeScript constant
 * is the value passed to `<ThemeProvider>` at runtime.
 *
 * They must stay in sync. This spec parses the CSS and asserts that every
 * variable in `defaultTheme.light` / `defaultTheme.dark` has the same value in
 * the corresponding CSS block.
 *
 * If this test fails, update both the `:root` / `.dark` blocks in
 * `src/index.css` and the matching map in `default-theme.ts`.
 */
function parseBlock(css: string, selector: string): Record<string, string> {
  // Match `:root { ... }` or `.dark { ... }`. Anchored at the start of a line
  // and using a non-greedy body so nested layer blocks don't confuse us.
  const re = new RegExp(
    `(?:^|\\n)\\s*${selector.replace(".", "\\.")}\\s*{([^}]*)}`,
    "m",
  );
  const match = css.match(re);
  if (!match) throw new Error(`Could not find ${selector} block in index.css`);

  const out: Record<string, string> = {};
  for (const line of match[1].split(";")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim();
    if (key.startsWith("--")) out[key] = value;
  }
  return out;
}

const RADIUS_KEY = "--radius";

describe("defaultTheme / index.css parity", () => {
  it("defaultTheme.light matches every --* in :root", () => {
    const cssVars = parseBlock(indexCss, ":root");
    for (const [key, value] of Object.entries(defaultTheme.light)) {
      if (key === RADIUS_KEY) continue;
      expect(cssVars[key], `index.css :root missing or mismatched ${key}`).toBe(
        value,
      );
    }
  });

  it("defaultTheme.dark matches every --* in .dark", () => {
    const cssVars = parseBlock(indexCss, ".dark");
    if (!defaultTheme.dark) {
      throw new Error("defaultTheme.dark is required for parity check");
    }
    for (const [key, value] of Object.entries(defaultTheme.dark)) {
      if (key === RADIUS_KEY) continue;
      expect(cssVars[key], `index.css .dark missing or mismatched ${key}`).toBe(
        value,
      );
    }
  });

  it(":root and .dark in index.css declare the same set of variables", () => {
    const rootVars = parseBlock(indexCss, ":root");
    const darkVars = parseBlock(indexCss, ".dark");
    expect(Object.keys(darkVars).sort()).toEqual(
      Object.keys(rootVars)
        .filter((k) => k !== RADIUS_KEY)
        .sort(),
    );
  });
});
