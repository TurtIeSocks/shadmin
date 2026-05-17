import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, WithHelperText } from "@/stories/admin/datagrid-input.stories";

describe("<DatagridInput />", () => {
  it("renders one row per choice", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Ada")).toBeInTheDocument();
    await expect.element(screen.getByText("Turing")).toBeInTheDocument();
    await expect.element(screen.getByText("Hopper")).toBeInTheDocument();
  });

  it("renders helper text when provided", async () => {
    const screen = render(<WithHelperText />);
    await expect
      .element(screen.getByText(/pick at least one team member/i))
      .toBeInTheDocument();
  });
});
