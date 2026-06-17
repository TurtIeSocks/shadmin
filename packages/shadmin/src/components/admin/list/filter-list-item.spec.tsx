import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/components/admin/list/filter-list-item.stories";

describe("<FilterListItem />", () => {
  it("renders the label of each filter item in the sidebar", async () => {
    const screen = render(<Basic />);
    await expect
      .poll(() => screen.getByText("Novel").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
    await expect.element(screen.getByText("Tale")).toBeInTheDocument();
  });
});
