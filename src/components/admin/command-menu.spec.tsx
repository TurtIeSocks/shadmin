import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { Basic, Hotkey, AdminShorthand } from "@/stories/command-menu.stories";

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
    const screen = render(<Hotkey />);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await expect
      .element(screen.getByRole("dialog"))
      .toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect
      .element(screen.getByRole("dialog"))
      .not.toBeInTheDocument();
  });

  it("auto-mounts via <Admin commandMenu>", async () => {
    const screen = render(<AdminShorthand />);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
