import { describe, expect, it } from "vitest";
import { useFormContext, useWatch } from "react-hook-form";
import { render } from "vitest-browser-react";
import { FeatureGroup, MapContainer, TileLayer } from "react-leaflet";
import { GeomanControls } from "react-leaflet-geoman-v2";
import type L from "leaflet";

import { useGeomanRHF } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";
import { DEFAULT_TILE_URL } from "@/components/leaflet/shared";

// Box used to smuggle the live feature group ref out of the hook so tests can
// poll its layer count from outside the React tree.
interface FeatureGroupBox {
  ref: React.MutableRefObject<L.FeatureGroup | null> | null;
}

interface MapBridgeProps {
  box?: FeatureGroupBox;
}

const MapBridge = ({ box }: MapBridgeProps) => {
  const { geomanControlsProps, featureGroupRef } = useGeomanRHF({
    source: "geom",
    shape: "Point",
    multi: false,
  });
  if (box) box.ref = featureGroupRef;
  return (
    <>
      <TileLayer url={DEFAULT_TILE_URL} />
      <FeatureGroup ref={featureGroupRef}>
        <GeomanControls
          options={{
            drawMarker: true,
            drawCircleMarker: false,
            drawPolyline: false,
            drawRectangle: false,
            drawPolygon: false,
            drawCircle: false,
            drawText: false,
          }}
          {...geomanControlsProps}
        />
      </FeatureGroup>
    </>
  );
};

interface HarnessProps {
  box?: FeatureGroupBox;
  seedValue?: GeoJSON.Geometry;
}

const Harness = ({
  box,
  seedValue = { type: "Point", coordinates: [2.35, 48.85] },
}: HarnessProps) => {
  const form = useFormContext();
  const geom = useWatch({ name: "geom" });
  return (
    <>
      <div data-testid="rhf-map">
        <MapContainer center={[0, 0]} zoom={2} style={{ height: 200 }}>
          <MapBridge box={box} />
        </MapContainer>
      </div>
      <div data-testid="value">{JSON.stringify(geom ?? null)}</div>
      <button
        type="button"
        data-testid="seed"
        onClick={() => form.setValue("geom", seedValue)}
      >
        seed
      </button>
    </>
  );
};

describe("useGeomanRHF", () => {
  it("renders inside a form without crashing", async () => {
    const screen = render(
      <StoryAdmin mode="form" record={{ geom: null }}>
        <Harness />
      </StoryAdmin>,
    );
    await expect.element(screen.getByTestId("rhf-map")).toBeInTheDocument();
  });

  it("seeds the form value via setValue and reflects it", async () => {
    const screen = render(
      <StoryAdmin mode="form" record={{ geom: null }}>
        <Harness />
      </StoryAdmin>,
    );
    await screen.getByTestId("seed").click();
    const v = await screen.getByTestId("value");
    expect(v.element().textContent).toContain('"Point"');
  });

  it("re-hydrates the feature group when the form value changes externally", async () => {
    // Regression for two related bugs:
    // 1. External writes (e.g. OsmWaterClipButton overwriting a polygon)
    //    silently updated the form value without ever updating the visible
    //    Leaflet layer, because the hydration effect was gated by a one-shot
    //    `hydrated` ref.
    // 2. On the initial draw, the hydration effect would also re-run and
    //    add a second layer for the same geometry the user had just drawn.
    // The fix is a `lastWrittenValue` ref that lets the effect distinguish
    // echoes of our own `persist()` writes from genuine external updates.
    const box: FeatureGroupBox = { ref: null };
    const screen = render(
      <StoryAdmin mode="form" record={{ geom: null }}>
        <Harness box={box} />
      </StoryAdmin>,
    );
    // Wait for the MapBridge to mount and the FeatureGroup ref to attach.
    // Layer count starts at 0 (record.geom is null).
    await expect
      .poll(() => box.ref?.current?.getLayers().length ?? -1)
      .toBe(0);

    await screen.getByTestId("seed").click();

    // After an external setValue, the layer should be rebuilt — exactly one
    // layer matching the seeded geometry, not zero (no update) and not two
    // (double-hydration).
    await expect
      .poll(() => box.ref?.current?.getLayers().length ?? 0)
      .toBe(1);
  });
});
