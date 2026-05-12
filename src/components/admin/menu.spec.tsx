import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Default, Grouped } from "@/stories/menu.stories";

describe("<Menu />", () => {
  it("renders the Default story", () => {
    render(<Default />);

    expect(true).toBe(true);
  });

  it("renders grouped resources before ungrouped resources", async () => {
    const screen = render(<Grouped />);

    await expect.element(screen.getByText("Content")).toBeInTheDocument();
    await expect.element(screen.getByText("Store")).toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /Customers/i }))
      .toBeInTheDocument();

    const menuText = document.body.textContent ?? "";

    expect(menuText.indexOf("Content")).toBeLessThan(menuText.indexOf("Posts"));
    expect(menuText.indexOf("Store")).toBeLessThan(menuText.indexOf("Orders"));
    expect(menuText.indexOf("Customers")).toBeGreaterThan(
      menuText.indexOf("Orders"),
    );
  });

  it("collapses auto-generated resource groups", async () => {
    const screen = render(<Grouped />);
    const contentGroup = screen.getByRole("button", { name: "Content" });
    const posts = screen.getByRole("link", { name: /Posts/i });
    const customers = screen.getByRole("link", { name: /Customers/i });

    await contentGroup.click();

    await expect.element(posts).not.toBeInTheDocument();
    await expect.element(customers).toBeVisible();
  });
});
