import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Published,
  TerminalState,
  WithGuard,
} from "@/stories/admin/status-transition-button.stories";

describe("<StatusTransitionButton />", () => {
  it("renders a button labelled with the current status", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText(/draft/i)).toBeInTheDocument();
  });

  it("lists allowed transitions in the dropdown for the current state", async () => {
    const screen = render(<Basic />);
    await screen.getByRole("button", { name: /draft/i }).click();
    await expect.element(screen.getByRole("menuitem", { name: /review/i })).toBeInTheDocument();
    await expect.element(screen.getByRole("menuitem", { name: /archived/i })).toBeInTheDocument();
  });

  it("only shows the single allowed transition from 'published'", async () => {
    const screen = render(<Published />);
    await screen.getByRole("button", { name: /published/i }).click();
    const items = document.querySelectorAll("[role='menuitem']");
    expect(items.length).toBe(1);
  });

  it("disables the trigger when there are no allowed transitions", async () => {
    const screen = render(<TerminalState />);
    const trigger = screen.container.querySelector("[data-status-trigger]") as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });

  it("filters transitions blocked by a guard predicate", async () => {
    const screen = render(<WithGuard />);
    await screen.getByRole("button", { name: /review/i }).click();
    // 'review' allows ['published', 'draft']; guard blocks 'published'
    const items = document.querySelectorAll("[role='menuitem']");
    expect(items.length).toBe(1);
    await expect.element(screen.getByRole("menuitem", { name: /draft/i })).toBeInTheDocument();
  });
});
