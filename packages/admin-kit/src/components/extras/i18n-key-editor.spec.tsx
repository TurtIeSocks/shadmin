import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Hidden,
  NoExport,
} from "./i18n-key-editor.stories";

describe("<I18nKeyEditor />", () => {
  it("renders the floating panel by default", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText(/missing keys/i)).toBeInTheDocument();
  });

  it("captures missing keys from useTranslate calls", async () => {
    const screen = render(<Basic />);
    // The CallerComponent translates 3 keys with the `custom.*` prefix that
    // aren't in englishMessages. Each should appear in the missing-keys panel
    // (rendered inside `[data-i18n-panel]` as font-mono spans).
    await expect.element(screen.getByText(/missing keys/i)).toBeInTheDocument();
    const panel = screen.container.querySelector("[data-i18n-panel]");
    expect(panel?.textContent ?? "").toContain("custom.foo.bar");
    expect(panel?.textContent ?? "").toContain("custom.foo.baz");
    expect(panel?.textContent ?? "").toContain("custom.missing.key");
  });

  it("does NOT list keys that resolved to a translation", async () => {
    const screen = render(<Basic />);
    // ra.action.save is a real key in englishMessages so it should not appear
    // in the missing-keys panel.
    // Wait for the panel to render first.
    await expect.element(screen.getByText(/missing keys/i)).toBeInTheDocument();
    const panel = screen.container.querySelector("[data-i18n-panel]");
    expect(panel?.textContent ?? "").not.toContain("ra.action.save");
  });

  it("hides the panel when defaultOpen=false", async () => {
    const screen = render(<Hidden />);
    await expect.element(screen.getByText(/missing keys/i)).toBeInTheDocument();
    const panel = screen.container.querySelector("[data-i18n-panel]");
    expect(panel?.getAttribute("data-open")).toBe("false");
  });

  it("hides the Export button when showExport=false", async () => {
    const screen = render(<NoExport />);
    await expect.element(screen.getByText(/missing keys/i)).toBeInTheDocument();
    expect(screen.container.querySelector("[data-i18n-export]")).toBeNull();
  });
});
