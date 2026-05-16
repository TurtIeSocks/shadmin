import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useOsmFeatures } from "./use-osm-features";

const wrapper = ({ children }: React.PropsWithChildren) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

const PARIS_BBOX: GeoJSON.BBox = [2.3, 48.85, 2.4, 48.9];

describe("useOsmFeatures", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("is disabled when bbox is null", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { result } = renderHook(() => useOsmFeatures(null, ["water"]), { wrapper });
    expect(result.current.data).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("is disabled when presets is empty", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { result } = renderHook(() => useOsmFeatures(PARIS_BBOX, []), { wrapper });
    expect(result.current.data).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fires an Overpass query for the requested presets and parses polygons", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        elements: [
          {
            type: "way",
            id: 1,
            nodes: [1, 2, 3, 1],
            tags: { natural: "water" },
            geometry: [
              { lat: 0, lon: 0 },
              { lat: 1, lon: 0 },
              { lat: 1, lon: 1 },
              { lat: 0, lon: 0 },
            ],
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    const { result } = renderHook(
      () => useOsmFeatures(PARIS_BBOX, ["water"]),
      { wrapper },
    );
    await vi.waitFor(() => expect(result.current.data).not.toBeNull());
    expect(fetchSpy).toHaveBeenCalledOnce();
    // The query body posted to Overpass should mention the water filter
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(String(init.body)).toContain("natural");
    expect(String(init.body)).toContain("water");
    // Parsed FeatureCollection holds at least one polygon
    expect(result.current.data?.features.length).toBeGreaterThan(0);
    expect(["Polygon", "MultiPolygon"]).toContain(
      result.current.data?.features[0].geometry.type,
    );
  });

  it("buffers LineString features into polygons when the roads preset is requested", async () => {
    // A short OSM `way` with highway=primary tags — should be buffered to a polygon
    // by useOsmFeatures because the roads preset declares `bufferLinesMeters: 15`.
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        elements: [
          {
            type: "way",
            id: 99,
            nodes: [10, 11],
            tags: { highway: "primary" },
            geometry: [
              { lat: 48.86, lon: 2.31 },
              { lat: 48.87, lon: 2.32 },
            ],
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    const { result } = renderHook(
      () => useOsmFeatures(PARIS_BBOX, ["roads"]),
      { wrapper },
    );
    await vi.waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.data?.features.length).toBeGreaterThan(0);
    // The line should have been turned into a polygon by buffering.
    expect(["Polygon", "MultiPolygon"]).toContain(
      result.current.data?.features[0].geometry.type,
    );
  });
});
