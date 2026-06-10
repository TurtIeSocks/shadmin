import { describe, expect, it, vi, beforeEach } from "vitest";
import { nominatimProvider } from "./nominatim-client";

describe("nominatimProvider.search", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("hits the search endpoint with the query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          display_name: "Paris, France",
          lat: "48.85",
          lon: "2.35",
          boundingbox: ["48.8", "48.9", "2.3", "2.4"],
          type: "city",
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);
    const results = await nominatimProvider.search("Paris");
    expect(results[0].displayName).toBe("Paris, France");
    expect(results[0].lat).toBe(48.85);
    expect(results[0].lng).toBe(2.35);
    expect(results[0].type).toBe("city");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("nominatim.openstreetmap.org");
    expect(String(url)).toContain("/search");
    expect(String(url)).toContain("q=Paris");
    expect(String(url)).toContain("format=json");
  });

  it("does NOT send a User-Agent header (browser forbids it)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);
    await nominatimProvider.search("anywhere");
    const [, init] = fetchMock.mock.calls[0];
    const headers = (init?.headers ?? {}) as Record<string, string>;
    // Browsers forbid setting User-Agent from fetch; we must not include it.
    expect(headers["User-Agent"]).toBeUndefined();
    expect(headers["user-agent"]).toBeUndefined();
    // We do send Accept-Language for predictable localised output.
    expect(headers["Accept-Language"]).toBe("en");
  });

  it("converts Nominatim boundingbox [minLat,maxLat,minLon,maxLon] to GeoJSON BBox [west,south,east,north]", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            display_name: "Paris, France",
            lat: "48.85",
            lon: "2.35",
            // Nominatim order: [minLat, maxLat, minLon, maxLon]
            boundingbox: ["48.8", "48.9", "2.3", "2.4"],
          },
        ],
      }),
    );
    const [res] = await nominatimProvider.search("Paris");
    // GeoJSON BBox order: [west, south, east, north] = [minLon, minLat, maxLon, maxLat]
    expect(res.bbox).toEqual([2.3, 48.8, 2.4, 48.9]);
  });

  it("forwards limit / countrycodes / viewbox options to the request URL", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);
    await nominatimProvider.search("foo", {
      limit: 5,
      countryCodes: ["fr", "de"],
      viewBox: [-1, 48, 3, 50],
    });
    const [url] = fetchMock.mock.calls[0];
    const s = String(url);
    expect(s).toContain("limit=5");
    expect(s).toContain("countrycodes=fr%2Cde");
    expect(s).toContain("viewbox=-1%2C48%2C3%2C50");
  });

  it("uses a custom endpoint when provided", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);
    await nominatimProvider.search("foo", {
      endpoint: "https://geo.example.com",
    });
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("geo.example.com");
  });

  it("throws on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );
    await expect(nominatimProvider.search("boom")).rejects.toThrow(/500/);
  });
});

describe("nominatimProvider.reverse", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("hits the reverse endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        display_name: "5 Rue de Rivoli",
        lat: "48.85",
        lon: "2.35",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const r = await nominatimProvider.reverse(48.85, 2.35);
    expect(r?.displayName).toContain("Rivoli");
    expect(r?.lat).toBe(48.85);
    expect(r?.lng).toBe(2.35);
    const [url] = fetchMock.mock.calls[0];
    const s = String(url);
    expect(s).toContain("/reverse");
    expect(s).toContain("lat=48.85");
    expect(s).toContain("lon=2.35");
    expect(s).toContain("format=json");
  });

  it("returns null on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    const r = await nominatimProvider.reverse(0, 0);
    expect(r).toBeNull();
  });

  it("does NOT send a User-Agent header on reverse", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ display_name: "X", lat: "0", lon: "0" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await nominatimProvider.reverse(0, 0);
    const [, init] = fetchMock.mock.calls[0];
    const headers = (init?.headers ?? {}) as Record<string, string>;
    expect(headers["User-Agent"]).toBeUndefined();
    expect(headers["user-agent"]).toBeUndefined();
    expect(headers["Accept-Language"]).toBe("en");
  });
});

describe("nominatimProvider polite rate limit", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("waits at least ~1s between sequential calls", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);
    // First call primes lastCallAt.
    await nominatimProvider.search("a");
    const start = Date.now();
    await nominatimProvider.search("b");
    const elapsed = Date.now() - start;
    // Allow a tiny scheduling slack (~50ms) so CI doesn't flake.
    expect(elapsed).toBeGreaterThanOrEqual(950);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
