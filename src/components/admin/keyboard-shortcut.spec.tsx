import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Sequence } from "@/stories/admin/keyboard-shortcut.stories";

describe("<KeyboardShortcut />", () => {
  it("renders mapped keys as kbd glyphs", async () => {
    const screen = render(<Basic theme="system" keyboardShortcut="mod+k" />);
    await expect.element(screen.getByText("⌘")).toBeInTheDocument();
    await expect.element(screen.getByText("K")).toBeInTheDocument();
  });

  it("renders sequence shortcuts as separate chord groups", async () => {
    const screen = render(<Sequence theme="system" />);
    await expect.element(screen.getByText("⇧")).toBeInTheDocument();
    await expect.element(screen.getByText("⌃")).toBeInTheDocument();
    await expect.element(screen.getByText("A")).toBeInTheDocument();
    await expect.element(screen.getByText("B")).toBeInTheDocument();
  });
});
