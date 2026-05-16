import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { PolygonFieldBasic, PolygonInputBasic } from "@/stories/leaflet-shapes.stories";

describe("<PolygonField />", () => {
  it("renders the GeoJSON layer with the given polygon", async () => {
    const screen = render(<PolygonFieldBasic />);
    // Wait for the leaflet path layer to mount.
    let path: Element | null = null;
    for (let i = 0; i < 50 && !path; i++) {
      path = screen.container.querySelector("path.leaflet-interactive");
      if (!path) await new Promise((r) => setTimeout(r, 50));
    }
    expect(path).not.toBeNull();
  });
});

describe("<PolygonInput />", () => {
  it("renders the toolbar with the polygon button", async () => {
    const screen = render(<PolygonInputBasic />);
    // Wait for the Geoman toolbar to mount.
    let polyBtn: Element | null = null;
    for (let i = 0; i < 50 && !polyBtn; i++) {
      polyBtn = screen.container.querySelector("[title*='polygon' i]");
      if (!polyBtn) await new Promise((r) => setTimeout(r, 50));
    }
    expect(polyBtn).not.toBeNull();
  });
});
