import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  ResolvedRecord,
  EmptyRecord,
  MissingRecord,
} from "@/stories/block-editor/reference-record.stories";

const block = (c: HTMLElement) =>
  c.querySelector('[data-block="referenceRecord"]') as HTMLElement;

describe("reference-record block", () => {
  it("resolves and renders the referenced record", async () => {
    const screen = render(<ResolvedRecord />);
    await expect.element(block(screen.container)).toHaveTextContent("Widget");
  });

  it("shows an empty state when no record is selected", async () => {
    const screen = render(<EmptyRecord />);
    await expect
      .element(block(screen.container))
      .toHaveTextContent(/pick a record/i);
  });

  it("shows an error state when the record is missing", async () => {
    const screen = render(<MissingRecord />);
    await expect
      .element(block(screen.container))
      .toHaveTextContent(/unavailable/i);
  });
});
