import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/keyboard-shortcut.stories";

describe("<KeyboardShortcut />", () => {
  it("renders the Basic story", () => {
    render(<Basic theme="system" keyboardShortcut="Meta+K" />);

    expect(true).toBe(true);
  });
});
