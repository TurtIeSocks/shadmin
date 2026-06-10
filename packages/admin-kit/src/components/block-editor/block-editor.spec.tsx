import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, ReadOnly, WithCallout } from "./block-editor.stories";

const pm = (c: HTMLElement) => c.querySelector(".ProseMirror") as HTMLElement;

describe("<BlockEditor />", () => {
  it("renders the initial document text", async () => {
    const screen = render(<Basic />);
    await expect
      .element(pm(screen.container))
      .toHaveTextContent("Hello blocks");
  });

  it("is not editable in read mode", async () => {
    const screen = render(<ReadOnly />);
    await expect
      .element(pm(screen.container))
      .toHaveAttribute("contenteditable", "false");
  });

  it("inserts a block chosen from the catalog picker", async () => {
    const screen = render(<WithCallout />);
    await expect.element(pm(screen.container)).toBeInTheDocument();
    // Open the picker via the programmatic channel (slash-keystroke simulation
    // is flaky under the browser provider; this exercises the same insert path).
    await screen.getByText("Open picker").click();
    await expect
      .element(screen.getByPlaceholder(/search blocks/i))
      .toBeInTheDocument();
    await screen.getByText("Callout").click();
    await expect
      .poll(() => pm(screen.container).querySelector('[data-block="callout"]'))
      .toBeTruthy();
  });
});
