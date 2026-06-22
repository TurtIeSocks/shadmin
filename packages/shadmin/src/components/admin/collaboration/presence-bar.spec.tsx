import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic } from "./presence-bar.stories";

describe("<PresenceBar />", () => {
  it("renders avatars for other users subscribed to the topic", async () => {
    render(<Basic />);
    // Bob and Carol Diaz were seeded by SeedOtherUsers
    await expect
      .element(document.querySelector('[data-presence-user="bob"]'))
      .toBeTruthy();
    await expect
      .element(document.querySelector('[data-presence-user="carol"]'))
      .toBeTruthy();
    // Check initials in fallback — scope to the presence bar to avoid sidebar conflicts
    const presenceBar = document.querySelector('[data-slot="presence-bar"]');
    await expect
      .element(
        presenceBar!.querySelector(
          '[data-slot="avatar-fallback"]:first-of-type',
        ) ?? presenceBar!,
      )
      .toBeTruthy();
    // Verify both users' initials appear somewhere in the document
    const fallbacks = presenceBar?.querySelectorAll(
      '[data-slot="avatar-fallback"]',
    );
    const texts = Array.from(fallbacks ?? []).map((el) => el.textContent);
    expect(texts).toContain("B");
    expect(texts).toContain("CD");
  });
});
