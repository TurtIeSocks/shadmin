import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useOsmWaterMask } from "./use-osm-water-mask";

const wrapper = ({ children }: React.PropsWithChildren) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("useOsmWaterMask", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("returns null while disabled", () => {
    const { result } = renderHook(() => useOsmWaterMask(null), { wrapper });
    expect(result.current.data).toBeNull();
  });

  it("fetches and parses Overpass response into a FeatureCollection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
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
      }),
    );
    const { result } = renderHook(() => useOsmWaterMask([0, 0, 2, 2]), { wrapper });
    await vi.waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.data?.features.length).toBeGreaterThan(0);
  });
});
