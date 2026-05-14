import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic } from "@/stories/command-menu.stories";

describe("<CommandMenu />", () => {
  it("renders the command dialog when opened", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
