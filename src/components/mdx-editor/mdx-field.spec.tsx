import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Empty } from "@/stories/mdx-field.stories";

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
});
