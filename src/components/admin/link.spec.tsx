import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, CustomClass } from "@/stories/admin/link.stories";

describe("<Link />", () => {
  it("renders the link with its label and href", async () => {
    const screen = render(<Basic />);
    const link = screen.getByRole("link", { name: "View post" });
    await expect.element(link).toBeInTheDocument();
    await expect.element(link).toHaveAttribute("href", "/posts/1");
  });

  it("applies a custom className", async () => {
    const screen = render(<CustomClass />);
    await expect
      .element(screen.getByRole("link", { name: "Danger zone" }))
      .toHaveClass("text-destructive");
  });
});
