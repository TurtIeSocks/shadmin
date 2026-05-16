import { describe, expect, it, vi, beforeEach } from "vitest";
import { snapToRoadsOnce } from "./use-osm-snap-to-roads";

describe("snapToRoadsOnce", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("calls OSRM match endpoint with semicolon-joined coords", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: "Ok",
          matchings: [
            {
              geometry: {
                type: "LineString",
                coordinates: [
                  [2.35, 48.85],
                  [2.36, 48.86],
                ],
              },
            },
          ],
        }),
      }),
    );
    const result = await snapToRoadsOnce({
      type: "LineString",
      coordinates: [
        [2.35, 48.85],
        [2.36, 48.86],
      ],
    });
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain("/match/v1/driving/");
    expect(result?.type).toBe("LineString");
  });
});
