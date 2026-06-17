import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Outline,
  Secondary,
  Empty,
} from "@/components/admin/fields/badge-field.stories";

describe("<BadgeField />", () => {
  it("renders the source value inside a badge", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("published")).toBeInTheDocument();
  });

  it("renders the outline variant", async () => {
    const screen = render(<Outline />);
    await expect.element(screen.getByText("published")).toBeInTheDocument();
  });

  it("renders the secondary variant", async () => {
    const screen = render(<Secondary />);
    await expect.element(screen.getByText("high")).toBeInTheDocument();
  });

  it("renders the empty placeholder when the value is missing", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
