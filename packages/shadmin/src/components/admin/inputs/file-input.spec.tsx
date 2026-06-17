import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/components/admin/inputs/file-input.stories";

describe("<FileInput />", () => {
  it("renders the file input with the humanized field label", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText(/attachments/i).first())
      .toBeInTheDocument();
  });

  it("renders the existing files from the record", async () => {
    const screen = render(<Basic />);
    // FileField renders an <a> for each file in the array.
    const links = screen.getByRole("link");
    expect(links.all().length).toBeGreaterThanOrEqual(2);
  });
});
