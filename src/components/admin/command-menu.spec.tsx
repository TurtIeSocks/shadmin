import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { Basic, Hotkey } from "@/stories/command-menu.stories";

describe("<CommandMenu />", () => {
  it("renders the command dialog when opened", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens on cmd+k", async () => {
    const screen = render(<Hotkey />);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes on escape", async () => {
    render(<Hotkey />);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    // CommandDialog uses radix close behavior; await disappearance
    await new Promise((r) => setTimeout(r, 50));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
