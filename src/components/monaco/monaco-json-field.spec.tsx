import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
  Basic,
  FixedHeight,
} from "@/stories/monaco/monaco-json-field.stories";

const waitForEditorText = async (
  container: HTMLElement,
  matcher: (text: string) => boolean,
  timeout = 8000,
) => {
  await vi.waitFor(
    () => {
      const lines = container.querySelectorAll(".view-line");
      const text = Array.from(lines)
        .map((line) => line.textContent ?? "")
        .join("\n");
      expect(matcher(text)).toBe(true);
    },
    { timeout, interval: 100 },
  );
};

// Monaco cold-boot can take several seconds in the browser provider; bump per-test
// timeout above the global 2500ms so vi.waitFor inside the test can actually finish.
const MONACO_TIMEOUT = 15000;

describe("<MonacoJsonField />", () => {
  it(
    "renders an object value as pretty JSON, read-only",
    async () => {
      const screen = render(<Basic />);
      await waitForEditorText(
        screen.container,
        (text) => text.includes('"theme"') && text.includes('"dark"'),
      );
    },
    MONACO_TIMEOUT,
  );

  it(
    "applies fixed height when autoHeight is false",
    async () => {
      const screen = render(<FixedHeight />);
      await waitForEditorText(screen.container, (text) =>
        text.includes('"theme"'),
      );
      const wrapper = screen.container.querySelector("[style*='height: 300px']");
      expect(wrapper).not.toBeNull();
    },
    MONACO_TIMEOUT,
  );
});
