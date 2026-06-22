import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  GeoJsonFieldEmpty,
  GeoJsonFieldPoint,
  GeoJsonFieldPolygon,
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

describe("<GeoJsonField />", () => {
  it("renders empty state for null geometry", async () => {
    const screen = render(<GeoJsonFieldEmpty />);
    await expect.element(screen.getByText(/no geometry/i)).toBeInTheDocument();
  });

  it("renders a Point", async () => {
    const screen = render(<GeoJsonFieldPoint />);
    const marker = await findAsync(
      screen.container,
      ".leaflet-marker-pane > *",
    );
    expect(marker).not.toBeNull();
  });

  it("renders a Polygon", async () => {
    const screen = render(<GeoJsonFieldPolygon />);
    const path = await findAsync(screen.container, "path.leaflet-interactive");
    expect(path).not.toBeNull();
  });
});
