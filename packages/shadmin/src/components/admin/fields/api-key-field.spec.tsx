import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  NeverUsed,
  WithLastUsed,
  WithScopes,
} from "./api-key-field.stories";

describe("<ApiKeyField />", () => {
  it("masks the key by default showing only the last 4 characters", async () => {
    const screen = render(<Basic />);
    const masked = screen.container.querySelector(
      "[data-api-key]",
    ) as HTMLElement;
    expect(masked.textContent ?? "").toMatch(/^[•*]+.{4}$/);
  });

  it("reveals the key on click of the reveal button", async () => {
    const screen = render(<Basic />);
    const reveal = screen.container.querySelector(
      "[data-api-key-reveal]",
    ) as HTMLButtonElement;
    reveal.click();
    await expect.element(screen.getByText("sk_live_***")).toBeInTheDocument();
  });

  it("renders scope badges when scopesSource is set", async () => {
    const screen = render(<WithScopes />);
    const badges = screen.container.querySelectorAll("[data-scope-badge]");
    expect(badges.length).toBe(2);
  });

  it("renders a relative 'last used' label when lastUsedSource is set and not null", async () => {
    const screen = render(<WithLastUsed />);
    await expect.element(screen.getByText(/hours? ago/i)).toBeInTheDocument();
  });

  it("renders 'Never' for last used when value is null", async () => {
    const screen = render(<NeverUsed />);
    await expect.element(screen.getByText(/never/i)).toBeInTheDocument();
  });
});
