import { describe, expect, it, vi, beforeEach } from "vitest";
import { queryOverpass, OverpassRateLimitError, OverpassTimeoutError } from "./overpass-client";

describe("queryOverpass", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("POSTs the query body with polite headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [] }) });
    vi.stubGlobal("fetch", fetchMock);
    await queryOverpass("[out:json];node;out;");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("overpass-api.de");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Content-Type"]).toContain("application/x-www-form-urlencoded");
    expect((init.body as string)).toContain("data=");
  });

  it("throws OverpassRateLimitError on 429", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429, statusText: "rate" }));
    await expect(queryOverpass("foo")).rejects.toBeInstanceOf(OverpassRateLimitError);
  });

  it("throws OverpassTimeoutError on 504", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 504, statusText: "timeout" }));
    await expect(queryOverpass("foo")).rejects.toBeInstanceOf(OverpassTimeoutError);
  });
});
