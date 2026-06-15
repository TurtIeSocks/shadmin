import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Dark, Empty } from "./mdx-field.stories";

const getEditorElement = (container: HTMLElement) =>
  container.querySelector(".mdxeditor [contenteditable]");

describe("<MdxField />", () => {
  it("should render markdown from the record source as read-only", async () => {
    const screen = render(<Basic />);
    const editor = getEditorElement(screen.container);

    expect(editor).not.toBeNull();
    await expect.element(editor as HTMLElement).toHaveTextContent("Hello");
    await expect.element(editor as HTMLElement).toHaveTextContent("markdown");
    await expect
      .element(editor as HTMLElement)
      .toHaveAttribute("contenteditable", "false");
  });

  it("should render emptyText when the source value is missing", async () => {
    const screen = render(<Empty />);
    const editor = getEditorElement(screen.container);

    expect(editor).not.toBeNull();
    await expect
      .element(editor as HTMLElement)
      .toHaveTextContent("No content yet");
  });

  it("should apply mdxeditor-dark class when theme is dark", async () => {
    const screen = render(<Dark />);
    await new Promise((r) => setTimeout(r, 100));
    const editor = screen.container.querySelector(".mdxeditor");
    expect(editor).not.toBeNull();
    expect(editor?.classList.contains("mdxeditor-dark")).toBe(true);
  });

  it("should not apply mdxeditor-dark class when theme is light", async () => {
    const screen = render(<Basic />);
    await new Promise((r) => setTimeout(r, 100));
    const editor = screen.container.querySelector(".mdxeditor");
    expect(editor).not.toBeNull();
    expect(editor?.classList.contains("mdxeditor-dark")).toBe(false);
  });
});
