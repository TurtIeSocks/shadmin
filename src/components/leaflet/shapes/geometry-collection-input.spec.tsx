import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  GeometryCollectionInputBasic,
  GeometryCollectionInputPolygonOnly,
} from "../leaflet-shapes.stories";

const findAsync = async (
  container: Element,
  selector: string,
): Promise<Element | null> => {
  let el: Element | null = null;
  for (let i = 0; i < 50 && !el; i++) {
    el = container.querySelector(selector);
    if (!el) await new Promise((r) => setTimeout(r, 50));
  }
  return el;
};

describe("<GeometryCollectionInput />", () => {
  it("renders with default shape buttons", async () => {
    const screen = render(<GeometryCollectionInputBasic />);
    // Default shapes ["Point","LineString","Polygon"] → marker + line + polygon buttons all visible
    const polyBtn = await findAsync(screen.container, "[title*='polygon' i]");
    const lineBtn = await findAsync(screen.container, "[title*='line' i]");
    const markerBtn = await findAsync(screen.container, "[title*='marker' i]");
    expect(polyBtn).not.toBeNull();
    expect(lineBtn).not.toBeNull();
    expect(markerBtn).not.toBeNull();
  });

  it("hides non-allowed shape buttons when allowedShapes is restricted", async () => {
    const screen = render(<GeometryCollectionInputPolygonOnly />);
    const polyBtn = await findAsync(screen.container, "[title*='polygon' i]");
    expect(polyBtn).not.toBeNull();
    // Polygon mounted ⇒ toolbar is ready ⇒ line/marker absence is meaningful.
    const lineBtn = screen.container.querySelector("[title*='line' i]");
    const markerBtn = screen.container.querySelector("[title*='marker' i]");
    expect(lineBtn).toBeNull();
    expect(markerBtn).toBeNull();
  });
});
