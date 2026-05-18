import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  FewLines,
  FullLayout,
} from "@/stories/admin/simple-list-loading.stories";

describe("<SimpleListLoading />", () => {
  it("renders the default number of skeleton rows", async () => {
    const screen = render(<Basic />);
    // Default is 5 fake lines.
    await expect.element(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("listitem").all().length).toBe(5);
  });

  it("renders the requested number of rows", async () => {
    const screen = render(<FewLines />);
    await expect.element(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("listitem").all().length).toBe(2);
  });

  it("renders the full layout with avatar slots", async () => {
    const screen = render(<FullLayout />);
    await expect.element(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("listitem").all().length).toBe(6);
  });
});
