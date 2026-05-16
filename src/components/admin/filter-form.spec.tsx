import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, NoFilters } from "@/stories/admin/filter-form.stories";

describe("<FilterForm />", () => {
  it("renders the always-on Search filter field", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByLabelText(/search/i))
      .toBeInTheDocument();
  });

  it("renders no filter inputs when the list has no filters configured", async () => {
    const screen = render(<NoFilters />);
    await expect
      .element(screen.getByRole("heading", { name: "Posts" }))
      .toBeInTheDocument();
    // No Search textbox should be rendered (it is only there when filters
    // include an alwaysOn filter).
    await expect
      .element(screen.getByLabelText(/search/i))
      .not.toBeInTheDocument();
  });
});
