import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { useFormContext } from "react-hook-form";

import { FeatureCollectionInput } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";
import {
  FeatureCollectionFieldBasic,
  FeatureCollectionInputBasic,
  FeatureCollectionInputSeeded,
} from "@/stories/leaflet-shapes.stories";

const findAsync = async (
  container: HTMLElement,
  selector: string,
): Promise<Element | null> => {
  let el: Element | null = null;
  for (let i = 0; i < 50 && !el; i++) {
    el = container.querySelector(selector);
    if (!el) await new Promise((r) => setTimeout(r, 50));
  }
  return el;
};

const ValueProbe = ({ source }: { source: string }) => {
  const form = useFormContext();
  const value = form.watch(source);
  return <pre data-testid="fc-value">{JSON.stringify(value ?? null)}</pre>;
};

describe("<FeatureCollectionField />", () => {
  it("renders multiple feature layers from a FeatureCollection", async () => {
    const screen = render(<FeatureCollectionFieldBasic />);
    // The polygon feature renders as a path; the point feature as a marker.
    const path = await findAsync(screen.container, "path.leaflet-interactive");
    expect(path).not.toBeNull();
    const marker = await findAsync(screen.container, ".leaflet-marker-icon");
    expect(marker).not.toBeNull();
  });
});

describe("<FeatureCollectionInput />", () => {
  it("renders polygon, line, and marker draw buttons by default", async () => {
    const screen = render(<FeatureCollectionInputBasic />);
    const polyBtn = await findAsync(screen.container, "[title*='polygon' i]");
    const lineBtn = await findAsync(screen.container, "[title*='line' i]");
    const markerBtn = await findAsync(screen.container, "[title*='marker' i]");
    expect(polyBtn).not.toBeNull();
    expect(lineBtn).not.toBeNull();
    expect(markerBtn).not.toBeNull();
  });

  it("hides non-allowed shape buttons when allowedShapes is restricted", async () => {
    const screen = render(
      <StoryAdmin mode="form" record={{ geom: null }}>
        <FeatureCollectionInput
          source="geom"
          allowedShapes={["Polygon"]}
          defaultCenter={[48.85, 2.35]}
        />
      </StoryAdmin>,
    );
    const polyBtn = await findAsync(screen.container, "[title*='polygon' i]");
    expect(polyBtn).not.toBeNull();
    const lineBtn = screen.container.querySelector("[title*='line' i]");
    const markerBtn = screen.container.querySelector("[title*='marker' i]");
    expect(lineBtn).toBeNull();
    expect(markerBtn).toBeNull();
  });

  it("hydrates a seeded FeatureCollection into drawable Leaflet layers", async () => {
    const screen = render(<FeatureCollectionInputSeeded />);
    // The seeded FC has one Point and one Polygon → expect a marker and a
    // polygon path on the map.
    const marker = await findAsync(screen.container, ".leaflet-marker-icon");
    const path = await findAsync(screen.container, "path.leaflet-interactive");
    expect(marker).not.toBeNull();
    expect(path).not.toBeNull();
  });

  it("preserves FeatureCollection shape in the form value after hydration", async () => {
    const seed: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [2.35, 48.85] },
          properties: { name: "a" },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [2.36, 48.86] },
          properties: { name: "b" },
        },
      ],
    };
    const screen = render(
      <StoryAdmin mode="form" record={{ geom: seed }}>
        <FeatureCollectionInput source="geom" defaultCenter={[48.85, 2.35]} />
        <ValueProbe source="geom" />
      </StoryAdmin>,
    );
    const probe = await screen.getByTestId("fc-value");
    // Hydration must not rewrite the form value. The seeded FC with both
    // features and their properties stays intact.
    expect(probe.element().textContent).toContain('"type":"FeatureCollection"');
    expect(probe.element().textContent).toContain('"name":"a"');
    expect(probe.element().textContent).toContain('"name":"b"');
  });
});
