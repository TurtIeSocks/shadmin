import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  AddButtonOnly,
} from "@/stories/admin/saved-queries.stories";

describe("<SavedQueries />", () => {
  it("renders Add and Remove saved-query icon buttons in the list actions", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /save current query/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /remove saved query/i }))
      .toBeInTheDocument();
  });

  it("opens the save-query dialog when the Add button is clicked", async () => {
    const screen = render(<AddButtonOnly />);
    const addBtn = screen.getByRole("button", { name: /save current query/i });
    await expect.element(addBtn).toBeInTheDocument();
    await addBtn.click();
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
