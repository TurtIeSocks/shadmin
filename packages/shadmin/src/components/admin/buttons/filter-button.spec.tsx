import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/components/admin/buttons/filter-button.stories";

describe("<FilterButton />", () => {
  it("should render the add filter button", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /add filter/i }))
      .toBeInTheDocument();
  });
});
