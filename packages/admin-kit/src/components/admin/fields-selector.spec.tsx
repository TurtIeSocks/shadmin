import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./fields-selector.stories";

describe("<FieldsSelector />", () => {
  it("renders one toggle per available field", async () => {
    const screen = render(<Basic />);
    // Seeded with 4 columns (Title, Author, Year, ISBN).
    await expect.element(screen.getByText("Title")).toBeInTheDocument();
    await expect.element(screen.getByText("Author")).toBeInTheDocument();
    await expect.element(screen.getByText("Year")).toBeInTheDocument();
    await expect.element(screen.getByText("ISBN")).toBeInTheDocument();
  });

  it("renders the Hide All / Show All shortcuts", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("button", { name: /hide all/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /show all/i }))
      .toBeInTheDocument();
  });
});
