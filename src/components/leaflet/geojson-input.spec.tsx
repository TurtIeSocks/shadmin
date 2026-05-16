import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  GeoJsonInputBasic,
  GeoJsonInputRestricted,
} from "@/stories/leaflet-shapes.stories";

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

describe("<GeoJsonInput />", () => {
  it("renders polygon, line, and marker draw buttons by default", async () => {
    const screen = render(<GeoJsonInputBasic />);
    const polyBtn = await findAsync(screen.container, "[title*='polygon' i]");
    const lineBtn = await findAsync(screen.container, "[title*='line' i]");
    const markerBtn = await findAsync(screen.container, "[title*='marker' i]");
    expect(polyBtn).not.toBeNull();
    expect(lineBtn).not.toBeNull();
    expect(markerBtn).not.toBeNull();
  });

  it("hides non-allowed shape buttons when shapes prop set", async () => {
    const screen = render(<GeoJsonInputRestricted />);
    const polyBtn = await findAsync(screen.container, "[title*='polygon' i]");
    expect(polyBtn).not.toBeNull();
    // Polygon mounted ⇒ toolbar is ready ⇒ line absence is meaningful.
    const lineBtn = screen.container.querySelector("[title*='line' i]");
    expect(lineBtn).toBeNull();
  });
});
