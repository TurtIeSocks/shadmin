import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  Basic,
  CustomIndent,
  Empty,
  StringValue,
} from "./json-field.stories";

describe("<JsonField />", () => {
  it("renders an object value as pretty-printed JSON", async () => {
    const screen = render(<Basic />);
    const pre = screen.container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toBe(
      '{\n  "theme": "dark",\n  "retries": 3,\n  "tags": [\n    "a",\n    "b"\n  ]\n}',
    );
  });

  it("renders a string value verbatim (parsed and re-stringified)", async () => {
    const screen = render(<StringValue />);
    const pre = screen.container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toContain('"theme"');
  });

  it("honors custom indent", async () => {
    const screen = render(<CustomIndent />);
    const pre = screen.container.querySelector("pre");
    expect(pre!.textContent).toBe(
      '{\n    "theme": "dark",\n    "retries": 3,\n    "tags": [\n        "a",\n        "b"\n    ]\n}',
    );
  });

  it("renders the `empty` prop when value is null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("No config")).toBeInTheDocument();
  });
});
