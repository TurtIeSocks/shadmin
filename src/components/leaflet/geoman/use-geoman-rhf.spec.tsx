import { describe, expect, it } from "vitest";
import { useFormContext, useWatch } from "react-hook-form";
import { render } from "vitest-browser-react";
import { MapContainer, TileLayer } from "react-leaflet";

import { GeomanControl, GeomanEvents, useGeomanRHF } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";
import { DEFAULT_TILE_URL } from "@/components/leaflet/shared";

const MapBridge = () => {
  const { geomanProps } = useGeomanRHF({
    source: "geom",
    shape: "Point",
    multi: false,
  });
  return (
    <>
      <TileLayer url={DEFAULT_TILE_URL} />
      <GeomanControl shapes={["Marker"]} />
      <GeomanEvents {...geomanProps} />
    </>
  );
};

const Harness = () => {
  const form = useFormContext();
  const geom = useWatch({ name: "geom" });
  return (
    <>
      <div data-testid="rhf-map">
        <MapContainer center={[0, 0]} zoom={2} style={{ height: 200 }}>
          <MapBridge />
        </MapContainer>
      </div>
      <div data-testid="value">{JSON.stringify(geom ?? null)}</div>
      <button
        type="button"
        data-testid="seed"
        onClick={() => form.setValue("geom", { type: "Point", coordinates: [2.35, 48.85] })}
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
});
