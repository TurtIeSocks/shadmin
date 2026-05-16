import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/file-field.stories";

describe("<FileField />", () => {
  it("renders each attachment as a link with its title and href", async () => {
    const screen = render(<Basic />);
    // The story provides 2 attachments; both share the same title text but
    // distinct URLs.
    const links = await screen
      .getByRole("link", { name: "Data Display/FileField" })
      .all();
    expect(links.length).toBeGreaterThanOrEqual(2);
    await expect
      .element(links[0])
      .toHaveAttribute("href", "https://example.org/document.pdf");
    await expect
      .element(links[1])
      .toHaveAttribute("href", "https://example.org/picture.png");
  });
});
