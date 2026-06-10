import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./file-field.stories";

describe("<FileField />", () => {
  it("renders each attachment as a link with its title and href", async () => {
    const screen = render(<Basic />);
    // The story provides 2 attachments with distinct titles and URLs.
    await expect
      .element(screen.getByRole("link", { name: "Cover image" }))
      .toHaveAttribute("href", "https://example.org/document.pdf");
    await expect
      .element(screen.getByRole("link", { name: "Project plan" }))
      .toHaveAttribute("href", "https://example.org/picture.png");
  });
});
