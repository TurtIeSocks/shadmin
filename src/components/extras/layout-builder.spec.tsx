import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomStoreKey,
  WithStoredOrder,
} from "@/stories/extras/layout-builder.stories";

describe("<LayoutBuilder />", () => {
  it("renders one row per available field", async () => {
    const screen = render(<Basic />);
    const rows = screen.container.querySelectorAll("[data-layout-row]");
    expect(rows.length).toBe(5);
  });

  it("displays fields in defaultOrder when provided", async () => {
    const screen = render(<WithStoredOrder />);
    const rows = Array.from(
      screen.container.querySelectorAll("[data-layout-row]"),
    ).map((r) => r.getAttribute("data-field"));
    expect(rows).toEqual([
      "title",
      "id",
      "author",
      "publishedAt",
      "views",
    ]);
  });

  it("respects custom storeKey", async () => {
    const screen = render(<CustomStoreKey />);
    const root = screen.container.querySelector(
      "[data-layout-builder]",
    ) as HTMLElement;
    expect(root.getAttribute("data-store-key")).toBe("my-custom-layout");
  });
});
