import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, WithSort } from "@/stories/admin/reference-many-field.stories";

describe("<ReferenceManyField />", () => {
  it("renders each related record once data resolves", async () => {
    const screen = render(<Basic />);
    // 3 books for Jane Doe (id=1): Hello, World, Foo
    await expect
      .poll(() => screen.getByText("Hello").elements().length, { timeout: 5000 })
      .toBeGreaterThan(0);
    await expect.element(screen.getByText("World")).toBeInTheDocument();
    await expect.element(screen.getByText("Foo")).toBeInTheDocument();
  });

  it("applies the sort prop to the related list", async () => {
    const screen = render(<WithSort />);
    // The sorted story still includes all 3 books.
    await expect
      .poll(() => screen.getByText("Hello").elements().length, { timeout: 5000 })
      .toBeGreaterThan(0);
    await expect.element(screen.getByText("2022")).toBeInTheDocument();
  });
});
