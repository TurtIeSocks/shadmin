import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Empty } from "@/components/admin/fields/email-field.stories";

describe("<EmailField />", () => {
  it("renders an anchor with the mailto: href and the email as text", async () => {
    const screen = render(<Basic />);
    const link = screen.getByRole("link", { name: "john.doe@example.org" });
    await expect.element(link).toBeInTheDocument();
    await expect
      .element(link)
      .toHaveAttribute("href", "mailto:john.doe@example.org");
  });

  it("renders the empty placeholder when the email is missing", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
