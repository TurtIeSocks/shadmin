import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { RecordListResolved, RecordListEmpty } from "./data-blocks.stories";

const block = (c: HTMLElement) =>
  c.querySelector('[data-block="recordList"]') as HTMLElement;

describe("record-list block", () => {
  it("renders rows for the resolved records", async () => {
    const screen = render(<RecordListResolved />);
    await expect.element(block(screen.container)).toHaveTextContent("Widget");
    await expect.element(block(screen.container)).toHaveTextContent("Gadget");
  });
  it("shows the empty state when no resource is configured", async () => {
    const screen = render(<RecordListEmpty />);
    await expect
      .element(block(screen.container))
      .toHaveTextContent(/pick a resource/i);
  });
});
