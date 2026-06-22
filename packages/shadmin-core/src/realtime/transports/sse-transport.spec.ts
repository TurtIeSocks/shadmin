import { describe, it, expect, vi, afterEach } from "vitest";
import { sseTransport } from "./sse-transport";

// The Vite dev server (same origin as the browser context) serves
// /sse and /sse-publish via the sseTestPlugin in vitest.config.ts.
const baseUrl = () => window.location.origin;
const transports: { disconnect?: () => void }[] = [];

afterEach(() => {
  while (transports.length) transports.shift()?.disconnect?.();
});

describe("sseTransport", () => {
  it("delivers a published event to a subscriber via the test server", async () => {
    const t = sseTransport({
      url: `${baseUrl()}/sse`,
      publishUrl: `${baseUrl()}/sse-publish`,
      reconnect: { enabled: false },
    });
    transports.push(t);
    const cb = vi.fn();
    t.subscribe("resource/posts", cb);
    await new Promise((r) => setTimeout(r, 150));
    await t.publish("resource/posts", {
      type: "created",
      payload: { ids: [1] },
    });
    await new Promise((r) => setTimeout(r, 150));
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ topic: "resource/posts", type: "created" }),
    );
  }, 10_000);

  it("rejects publish with no publishUrl", async () => {
    const t = sseTransport({
      url: `${baseUrl()}/sse`,
      reconnect: { enabled: false },
    });
    transports.push(t);
    await expect(
      t.publish("x", { type: "created", payload: {} }),
    ).rejects.toThrow(/publishUrl/);
  });
});
