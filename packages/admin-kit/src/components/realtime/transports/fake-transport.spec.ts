import { describe, it, expect, vi } from "vitest";
import { fakeTransport } from "./fake-transport";

describe("fakeTransport", () => {
  it("delivers events to subscribers of the matching topic", async () => {
    const t = fakeTransport();
    const cb = vi.fn();
    t.subscribe("resource/posts", cb);
    await t.publish("resource/posts", { type: "created", payload: { ids: [1] } });
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0]).toMatchObject({
      topic: "resource/posts",
      type: "created",
      payload: { ids: [1] },
    });
  });

  it("does not deliver to other topics", async () => {
    const t = fakeTransport();
    const cb = vi.fn();
    t.subscribe("resource/posts", cb);
    await t.publish("resource/comments", { type: "created", payload: {} });
    expect(cb).not.toHaveBeenCalled();
  });

  it("unsubscribe stops further delivery", async () => {
    const t = fakeTransport();
    const cb = vi.fn();
    const unsub = t.subscribe("resource/posts", cb);
    unsub();
    await t.publish("resource/posts", { type: "created", payload: {} });
    expect(cb).not.toHaveBeenCalled();
  });

  it("supports multiple subscribers on the same topic", async () => {
    const t = fakeTransport();
    const a = vi.fn();
    const b = vi.fn();
    t.subscribe("x", a);
    t.subscribe("x", b);
    await t.publish("x", { type: "created", payload: {} });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("isolates throwing subscribers", async () => {
    const onError = vi.fn();
    const t = fakeTransport({ onError });
    const bad = vi.fn(() => {
      throw new Error("boom");
    });
    const good = vi.fn();
    t.subscribe("x", bad);
    t.subscribe("x", good);
    await t.publish("x", { type: "created", payload: {} });
    expect(good).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "handler_threw", topic: "x" })
    );
  });

  it("records published events", async () => {
    const t = fakeTransport();
    await t.publish("a", { type: "created", payload: { ids: [1] } });
    await t.publish("b", { type: "updated", payload: { ids: [2] } });
    expect(t.publishedEvents).toHaveLength(2);
    expect(t.publishedEvents[0]).toEqual({
      topic: "a",
      event: { type: "created", payload: { ids: [1] } },
    });
  });

  it("simulateReconnect fires onReconnect listeners", () => {
    const t = fakeTransport();
    const cb = vi.fn();
    t.onReconnect?.(cb);
    t.simulateReconnect();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("delayMs delays dispatch", async () => {
    const t = fakeTransport({ delayMs: 20 });
    const cb = vi.fn();
    t.subscribe("x", cb);
    const before = Date.now();
    await t.publish("x", { type: "created", payload: {} });
    expect(Date.now() - before).toBeGreaterThanOrEqual(15);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
