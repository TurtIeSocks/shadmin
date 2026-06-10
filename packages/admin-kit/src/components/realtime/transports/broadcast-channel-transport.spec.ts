import { describe, it, expect, vi, afterEach } from "vitest";
import { broadcastChannelTransport } from "./broadcast-channel-transport";

const channels: { disconnect?: () => void }[] = [];

afterEach(() => {
  while (channels.length) channels.shift()?.disconnect?.();
});

describe("broadcastChannelTransport", () => {
  it("delivers events across two instances on the same channel", async () => {
    const a = broadcastChannelTransport({ channel: "test-rt" });
    const b = broadcastChannelTransport({ channel: "test-rt" });
    channels.push(a, b);
    const cb = vi.fn();
    b.subscribe("x", cb);

    await a.publish("x", { type: "created", payload: { ids: [1] } });
    await new Promise((r) => setTimeout(r, 30));

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("filters by topic", async () => {
    const a = broadcastChannelTransport({ channel: "test-rt-2" });
    const b = broadcastChannelTransport({ channel: "test-rt-2" });
    channels.push(a, b);
    const cb = vi.fn();
    b.subscribe("only-this", cb);
    await a.publish("other", { type: "created", payload: {} });
    await new Promise((r) => setTimeout(r, 30));
    expect(cb).not.toHaveBeenCalled();
  });
});
