import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, WithoutCreate, ResourceSpecificLabel } from "./empty.stories";

describe("<Empty />", () => {
  it("renders the default empty-state message and a create link", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText(/no posts yet/i)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /create/i }))
      .toBeInTheDocument();
  });

  it("hides the create link when the resource has no create route", async () => {
    const screen = render(<WithoutCreate />);
    await expect.element(screen.getByText(/no posts yet/i)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /create/i }))
      .not.toBeInTheDocument();
  });

  it("uses the resource-specific empty message when provided", async () => {
    const screen = render(<ResourceSpecificLabel />);
    await expect
      .element(screen.getByText("Your post list is empty."))
      .toBeInTheDocument();
  });
});
