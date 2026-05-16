import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Default } from "@/stories/admin/breadcrumb.stories";

describe("<Breadcrumb />", () => {
  it("renders the breadcrumb navigation portal once the list view loads", async () => {
    const screen = render(<Default />);
    await expect
      .element(screen.getByRole("navigation", { name: /breadcrumb/i }))
      .toBeInTheDocument();
  });
});
