import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Default, SaveOnly, CancelAndSave } from "./toolbar.stories";

describe("<Toolbar />", () => {
  it("should render a Save button by default", async () => {
    const screen = render(<Default theme="system" />);
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeInTheDocument();
  });

  it("should render a Delete button by default", async () => {
    const screen = render(<Default theme="system" />);
    await expect
      .element(screen.getByRole("button", { name: /delete/i }))
      .toBeInTheDocument();
  });

  it("should have role=toolbar", async () => {
    const { container } = render(<Default theme="system" />);
    const toolbar = container.querySelector('[role="toolbar"]');
    expect(toolbar).toBeTruthy();
  });

  it("should render only the Save button when passed as child", async () => {
    const screen = render(<SaveOnly theme="system" />);
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeInTheDocument();
    // No delete button in SaveOnly
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await expect.element(deleteButton).not.toBeInTheDocument();
  });

  it("should render custom Cancel and Save children", async () => {
    const screen = render(<CancelAndSave theme="system" />);
    await expect
      .element(screen.getByRole("button", { name: /cancel/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeInTheDocument();
  });
});
