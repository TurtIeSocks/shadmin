import { describe, it, expect, vi } from "vitest";
import fakeRestProvider from "ra-data-fakerest";
import { realtimeDataProvider } from "./realtime-data-provider";
import { fakeTransport } from "./transports/fake-transport";
import type { LockProvider } from "./types";

const baseDP = () =>
  fakeRestProvider({ posts: [{ id: 1, title: "x" }] }, false);

describe("realtimeDataProvider", () => {
  it("delegates getList to the base data provider", async () => {
    const dp = realtimeDataProvider(baseDP(), fakeTransport());
    const result = await dp.getList("posts", {
      pagination: { page: 1, perPage: 10 },
      sort: { field: "id", order: "ASC" },
      filter: {},
    });
    expect(result.data).toHaveLength(1);
  });

  it("wires subscribe through the transport", () => {
    const transport = fakeTransport();
    const dp = realtimeDataProvider(baseDP(), transport);
    const cb = vi.fn();
    const unsub = dp.subscribe("resource/posts", cb);
    expect(typeof unsub).toBe("function");
  });

  it("wires publish through the transport", async () => {
    const transport = fakeTransport();
    const dp = realtimeDataProvider(baseDP(), transport);
    await dp.publish("resource/posts", {
      type: "created",
      payload: { ids: [1] },
    });
    expect(transport.publishedEvents).toHaveLength(1);
    expect(transport.publishedEvents[0]).toEqual({
      topic: "resource/posts",
      event: { type: "created", payload: { ids: [1] } },
    });
  });

  it("subscribe -> publish round-trip invokes the callback", async () => {
    const transport = fakeTransport();
    const dp = realtimeDataProvider(baseDP(), transport);
    const cb = vi.fn();
    dp.subscribe("resource/posts", cb);
    await dp.publish("resource/posts", {
      type: "created",
      payload: { ids: [1] },
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("throws a clear error when lock is called without LockProvider", async () => {
    const dp = realtimeDataProvider(baseDP(), fakeTransport());
    await expect(
      dp.lock("posts", { id: 1, identity: "alice" }),
    ).rejects.toThrow(/no LockProvider was configured/);
  });

  it("delegates lock to the configured LockProvider", async () => {
    const locks: LockProvider = {
      lock: vi.fn(async (resource, params) => ({
        resource,
        recordId: params.id,
        identity: params.identity,
        createdAt: "2026-01-01T00:00:00.000Z",
      })),
      unlock: vi.fn(),
      getLock: vi.fn(),
      getLocks: vi.fn(),
    };
    const dp = realtimeDataProvider(baseDP(), fakeTransport(), { locks });
    const result = await dp.lock("posts", { id: 1, identity: "alice" });
    expect(locks.lock).toHaveBeenCalledWith("posts", {
      id: 1,
      identity: "alice",
    });
    expect(result.identity).toBe("alice");
  });
});
