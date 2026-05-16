import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Empty,
  Resolvable,
} from "@/stories/extras/comments-thread.stories";

describe("<CommentsThread />", () => {
  it("renders one card per comment matching the parent", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Looks good to me.")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Let's also bump the version."))
      .toBeInTheDocument();
    // Unrelated comment with parentId=99 should NOT render
    expect(screen.container.textContent ?? "").not.toContain("Unrelated comment");
  });

  it("renders the author name on each card", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Alice")).toBeInTheDocument();
    await expect.element(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows a 'Mark resolved' button when resolvable prop is set", async () => {
    const screen = render(<Resolvable />);
    // Wait for comments to render (data loads async)
    await expect.element(screen.getByText("Alice")).toBeInTheDocument();
    const btn = screen.container.querySelector("[data-resolve-button]");
    expect(btn).toBeTruthy();
  });

  it("renders empty state when there are no comments", async () => {
    const screen = render(<Empty />);
    await expect
      .element(screen.getByText(/no comments yet/i))
      .toBeInTheDocument();
  });

  it("renders a new-comment textarea", async () => {
    const screen = render(<Basic />);
    // Wait for content to render (data loads async)
    await expect.element(screen.getByText("Alice")).toBeInTheDocument();
    const ta = screen.container.querySelector(
      "textarea[data-new-comment-body]",
    ) as HTMLTextAreaElement;
    expect(ta).toBeTruthy();
  });
});
