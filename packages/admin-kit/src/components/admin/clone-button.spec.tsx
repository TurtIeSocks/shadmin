import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Default,
  CustomLabel,
  ResourceSpecificLabel,
} from "./clone-button.stories";

describe("<CloneButton />", () => {
  it("renders the default Clone link", async () => {
    const screen = render(<Default />);
    await expect
      .element(screen.getByRole("link", { name: /clone/i }))
      .toBeInTheDocument();
  });

  it("links to the create page with the record state in the query string", async () => {
    const screen = render(<Default />);
    const link = screen.getByRole("link", { name: /clone/i });
    const el = link.element() as HTMLAnchorElement;
    expect(el.getAttribute("href")).toContain("/posts/create");
    expect(el.getAttribute("href")).toContain("source=");
  });

  it("renders with a custom label", async () => {
    const screen = render(<CustomLabel />);
    await expect
      .element(screen.getByRole("link", { name: /duplicate/i }))
      .toBeInTheDocument();
  });

  it("renders with a resource-specific label", async () => {
    const screen = render(<ResourceSpecificLabel />);
    await expect
      .element(screen.getByRole("link", { name: /duplicate this post/i }))
      .toBeInTheDocument();
  });
});
