import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  NoLink,
  ShowLink,
} from "@/stories/admin/simple-list-item.stories";

describe("<SimpleListItem />", () => {
  it("renders the item's children", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("War and Peace")).toBeInTheDocument();
    await expect.element(screen.getByText("Leo Tolstoy")).toBeInTheDocument();
  });

  it("wraps the item in a link by default", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByRole("link")).toBeInTheDocument();
  });

  it("does not render a link when linkType is false", async () => {
    const screen = render(<NoLink />);
    await expect.element(screen.getByRole("link")).not.toBeInTheDocument();
  });

  it("links to the show route when linkType='show'", async () => {
    const screen = render(<ShowLink />);
    const link = screen.getByRole("link");
    await expect.element(link).toHaveAttribute("href", "/books/42/show");
  });
});
