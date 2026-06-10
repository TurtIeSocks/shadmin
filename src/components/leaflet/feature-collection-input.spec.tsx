import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  PolygonOnly,
  Seeded,
} from "./feature-collection-input.stories";

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

describe("<FeatureCollectionInput />", () => {
  it("renders the labeled map input with a Leaflet container and default tools", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText("Feature collection"))
      .toBeInTheDocument();
    const wrapper = await screen.getByTestId("feature-collection-input");
    await expect.element(wrapper).toBeInTheDocument();
    expect(
      wrapper.element().querySelector(".leaflet-container"),
    ).not.toBeNull();
    // Default allowedShapes = ["Point", "LineString", "Polygon"] → marker, line,
    // and polygon draw buttons should mount on the Geoman toolbar.
    const polyBtn = await findAsync(screen.container, "[title*='polygon' i]");
    const lineBtn = await findAsync(screen.container, "[title*='line' i]");
    const markerBtn = await findAsync(screen.container, "[title*='marker' i]");
    expect(polyBtn).not.toBeNull();
    expect(lineBtn).not.toBeNull();
    expect(markerBtn).not.toBeNull();
  });

  it("hides non-allowed shape buttons when allowedShapes is restricted", async () => {
    const screen = render(<PolygonOnly />);
    const polyBtn = await findAsync(screen.container, "[title*='polygon' i]");
    expect(polyBtn).not.toBeNull();
    // Polygon button mounted ⇒ toolbar is ready ⇒ absence of line/marker is
    // a real assertion, not a timing fluke.
    const lineBtn = screen.container.querySelector("[title*='line' i]");
    const markerBtn = screen.container.querySelector("[title*='marker' i]");
    expect(lineBtn).toBeNull();
    expect(markerBtn).toBeNull();
  });

  it("hydrates a seeded FeatureCollection into drawable Leaflet layers", async () => {
    const screen = render(<Seeded />);
    // The seeded FC has one Point and one Polygon → expect a marker icon and
    // a polygon path on the map.
    const marker = await findAsync(screen.container, ".leaflet-marker-icon");
    const path = await findAsync(screen.container, "path.leaflet-interactive");
    expect(marker).not.toBeNull();
    expect(path).not.toBeNull();
  });
});
