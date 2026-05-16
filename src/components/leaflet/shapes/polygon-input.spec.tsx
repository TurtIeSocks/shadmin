import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { PolygonFieldBasic, PolygonInputBasic } from "@/stories/leaflet-shapes.stories";

const findAsync = async (container: HTMLElement, selector: string): Promise<Element | null> => {
  let el: Element | null = null;
  for (let i = 0; i < 50 && !el; i++) {
    el = container.querySelector(selector);
    if (!el) await new Promise((r) => setTimeout(r, 50));
  }
  return el;
};

describe("<PolygonField />", () => {
  it("renders the GeoJSON layer with the given polygon", async () => {
    const screen = render(<PolygonFieldBasic />);
    const path = await findAsync(screen.container, "path.leaflet-interactive");
    expect(path).not.toBeNull();
  });
});

describe("<PolygonInput />", () => {
  it("renders the toolbar with the polygon button", async () => {
    const screen = render(<PolygonInputBasic />);
    const polyBtn = await findAsync(screen.container, "[title*='polygon' i]");
    expect(polyBtn).not.toBeNull();
  });

  it("renders the rectangle and circle draw buttons", async () => {
    const screen = render(<PolygonInputBasic />);
    const rectBtn = await findAsync(screen.container, "[title*='rectangle' i]");
    const circBtn = await findAsync(screen.container, "[title*='circle' i]");
    expect(rectBtn).not.toBeNull();
    expect(circBtn).not.toBeNull();
  });

  it("does NOT render the polyline or marker draw buttons", async () => {
    const screen = render(<PolygonInputBasic />);
    // Wait for the toolbar to mount so we can assert negatives reliably.
    await findAsync(screen.container, "[title*='polygon' i]");
    // Match only the "draw polyline / line" toolbar button, not generic
    // selection/edit-line buttons.
    const lineBtn = screen.container.querySelector("[title*='draw poly' i]:not([title*='polygon' i])");
    const markerBtn = screen.container.querySelector("[title*='draw marker' i]");
    expect(lineBtn).toBeNull();
    expect(markerBtn).toBeNull();
  });
});
