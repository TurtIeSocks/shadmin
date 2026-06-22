import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Edit,
  ListMode,
  Show,
  WithOverride,
} from "./schema-driven-view.stories";

describe("<SchemaDrivenView />", () => {
  it("renders one field per property in show mode", async () => {
    const screen = render(<Show />);
    await expect.element(screen.getByText("First post")).toBeInTheDocument();
    await expect
      .element(screen.getByText("alice@example.com"))
      .toBeInTheDocument();
  });

  it("renders inputs in edit mode", async () => {
    const screen = render(<Edit />);
    const titleInput = screen.container.querySelector(
      "input[name='title']",
    ) as HTMLInputElement;
    expect(titleInput).toBeTruthy();
    expect(titleInput.value).toBe("First post");
  });

  it("renders a data-table in list mode", async () => {
    const screen = render(<ListMode />);
    const table = screen.container.querySelector("table");
    expect(table).toBeTruthy();
    await expect.element(screen.getByText("First post")).toBeInTheDocument();
  });

  it("respects override prop", async () => {
    const screen = render(<WithOverride />);
    const overridden = screen.container.querySelector("[data-override-title]");
    expect(overridden).toBeTruthy();
  });
});
