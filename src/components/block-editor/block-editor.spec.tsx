import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, ReadOnly } from "@/stories/block-editor/block-editor.stories";

const pm = (c: HTMLElement) => c.querySelector(".ProseMirror") as HTMLElement;

describe("<BlockEditor />", () => {
  it("renders the initial document text", async () => {
    const screen = render(<Basic />);
    await expect.element(pm(screen.container)).toHaveTextContent("Hello blocks");
  });

  it("is not editable in read mode", async () => {
    const screen = render(<ReadOnly />);
    await expect
      .element(pm(screen.container))
      .toHaveAttribute("contenteditable", "false");
  });
});
