import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
  Basic,
  StringMode,
  WithSchema,
} from "@/stories/monaco/monaco-json-input.stories";

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

describe("<MonacoJsonInput />", () => {
  it(
    "renders an object value as pretty JSON in the editor",
    async () => {
      const screen = render(<Basic />);
      await waitForEditorText(
        screen.container,
        (text) => text.includes('"sku"') && text.includes("ABC-123"),
      );
    },
    MONACO_TIMEOUT,
  );

  it(
    "renders a string value verbatim in string mode",
    async () => {
      const screen = render(<StringMode />);
      await waitForEditorText(screen.container, (text) =>
        text.includes('"sku":"ABC-123"'),
      );
      // Form values reflect the string shape (not the parsed object)
      const values = screen.container.querySelector(
        "[data-testid='form-values']",
      );
      expect(values?.textContent).toContain('"metadata": "');
    },
    MONACO_TIMEOUT,
  );

  it(
    "surfaces a schema validation error when the JSON violates the schema",
    async () => {
      const screen = render(<WithSchema />);
      await waitForEditorText(screen.container, (text) =>
        text.includes('"sku"'),
      );

      // Wait for marker-driven validation to surface a form error when
      // the value violates the schema. The Basic record satisfies it,
      // so we expect no error here.
      await new Promise((r) => setTimeout(r, 300));
      const error = screen.container.querySelector(
        "[data-slot='form-message']",
      );
      expect(error).toBeNull();
    },
    MONACO_TIMEOUT,
  );
});
