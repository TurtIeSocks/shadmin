import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  ExternalChanges,
  Validation,
} from "./block-editor-input.stories";

const pm = (c: HTMLElement) => c.querySelector(".ProseMirror") as HTMLElement;

describe("<BlockEditorInput />", () => {
  it("renders the field label and initial value", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText("Body", { exact: true }))
      .toBeInTheDocument();
    await expect.element(pm(screen.container)).toHaveTextContent("Initial content");
  });

  it("shows a validation error when required and empty", async () => {
    const screen = render(<Validation />);
    await screen.getByRole("button", { name: /save/i }).click();
    await expect.element(screen.getByText("Required")).toBeInTheDocument();
  });

  it("updates when the form value changes externally", async () => {
    const screen = render(<ExternalChanges />);
    await screen.getByRole("button", { name: /change value/i }).click();
    await expect
      .element(pm(screen.container))
      .toHaveTextContent("Value changed externally.");
  });
});
