import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Empty } from "./block-doc-field.stories";

const pm = (c: HTMLElement) => c.querySelector(".ProseMirror") as HTMLElement;

describe("<BlockDocField />", () => {
  it("renders the stored doc read-only", async () => {
    const screen = render(<Basic />);
    const el = pm(screen.container);
    await expect.element(el).toHaveTextContent("Stored content");
    await expect.element(el).toHaveAttribute("contenteditable", "false");
  });

  it("renders nothing when the field is empty", async () => {
    const screen = render(<Empty />);
    expect(pm(screen.container)).toBeNull();
  });
});
