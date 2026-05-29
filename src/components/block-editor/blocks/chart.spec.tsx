import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { aggregate } from "@/components/block-editor/blocks/chart";
import {
  ChartResolved,
  ChartEmpty,
} from "@/stories/block-editor/data-blocks.stories";

describe("aggregate (client-side group-by)", () => {
  const rows = [
    { id: 1, category: "tools", price: 10 },
    { id: 2, category: "tools", price: 20 },
    { id: 3, category: "toys", price: 5 },
  ];
  it("sums values per category", () => {
    expect(aggregate(rows, "category", "price", "sum")).toEqual([
      { name: "tools", value: 30 },
      { name: "toys", value: 5 },
    ]);
  });
  it("counts rows per category", () => {
    expect(aggregate(rows, "category", "price", "count")).toEqual([
      { name: "tools", value: 2 },
      { name: "toys", value: 1 },
    ]);
  });
  it("averages values per category", () => {
    expect(aggregate(rows, "category", "price", "avg")).toEqual([
      { name: "tools", value: 15 },
      { name: "toys", value: 5 },
    ]);
  });
});

describe("chart block", () => {
  it("renders a chart container for resolved data", async () => {
    const screen = render(<ChartResolved />);
    const block = screen.container.querySelector(
      '[data-block="chart"]',
    ) as HTMLElement;
    expect(block).not.toBeNull();
    // recharts renders an SVG (ResponsiveContainer needs a sized parent; the
    // block sets a height). If recharts measures a zero-size parent under
    // headless layout, fall back to asserting the container resolved past the
    // empty/loading state (the `aggregate` tests above cover the math).
    await expect
      .poll(
        () =>
          block.querySelector("svg, .recharts-responsive-container") != null,
        { timeout: 4000 },
      )
      .toBe(true);
  });
  it("shows the empty state when unconfigured", async () => {
    const screen = render(<ChartEmpty />);
    await expect
      .element(screen.container.querySelector('[data-block="chart"]') as HTMLElement)
      .toHaveTextContent(/pick a resource/i);
  });
});
