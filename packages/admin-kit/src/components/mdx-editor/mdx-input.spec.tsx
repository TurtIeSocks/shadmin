import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomLabel,
  Disabled,
  ExternalChanges,
  ReadOnly,
  Validation,
} from "./mdx-input.stories";

const getEditorElement = (container: HTMLElement) =>
  container.querySelector(".mdxeditor [contenteditable]");

describe("<MdxInput />", () => {
  it("should render the initial markdown value", async () => {
    const screen = render(<Basic theme="system" />);
    const editor = getEditorElement(screen.container);

    expect(editor).not.toBeNull();
    await expect.element(editor as HTMLElement).toHaveTextContent("Hello");
    await expect
      .element(editor as HTMLElement)
      .toHaveTextContent("initial markdown");
  });

  it("should render the default toolbar", async () => {
    const screen = render(<Basic theme="system" />);

    await expect
      .element(screen.getByLabelText("Bold").first())
      .toBeInTheDocument();
  });

  it("should render with a custom label", async () => {
    const screen = render(<CustomLabel theme="system" />);

    await expect.element(screen.getByText("Article body")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Markdown is supported."))
      .toBeInTheDocument();
  });

  it("should render as disabled", async () => {
    const screen = render(<Disabled theme="system" />);
    const editor = getEditorElement(screen.container);

    expect(editor).not.toBeNull();
    await expect
      .element(editor as HTMLElement)
      .toHaveAttribute("contenteditable", "false");
  });

  it("should render as readOnly", async () => {
    const screen = render(<ReadOnly theme="system" />);
    const editor = getEditorElement(screen.container);

    expect(editor).not.toBeNull();
    await expect
      .element(editor as HTMLElement)
      .toHaveAttribute("contenteditable", "false");
  });

  it("should display validation error when required and empty", async () => {
    const screen = render(<Validation theme="system" />);
    const submitButton = screen.getByRole("button", { name: /save/i });

    await submitButton.click();
    await expect.element(screen.getByText("Required")).toBeInTheDocument();
  });

  it("should update when value changes externally", async () => {
    const screen = render(<ExternalChanges theme="system" />);
    const changeValueButton = screen.getByText("Change value");

    await changeValueButton.click();

    const editor = getEditorElement(screen.container);
    expect(editor).not.toBeNull();
    await expect
      .element(editor as HTMLElement)
      .toHaveTextContent("Value changed externally.");
  });

  it("should apply mdxeditor-dark class when theme is dark", async () => {
    const screen = render(<Basic theme="dark" />);
    await new Promise((r) => setTimeout(r, 100));
    const editor = screen.container.querySelector(".mdxeditor");
    expect(editor).not.toBeNull();
    expect(editor?.classList.contains("mdxeditor-dark")).toBe(true);
  });

  it("should not apply mdxeditor-dark class when theme is light", async () => {
    const screen = render(<Basic theme="light" />);
    await new Promise((r) => setTimeout(r, 100));
    const editor = screen.container.querySelector(".mdxeditor");
    expect(editor).not.toBeNull();
    expect(editor?.classList.contains("mdxeditor-dark")).toBe(false);
  });
});
