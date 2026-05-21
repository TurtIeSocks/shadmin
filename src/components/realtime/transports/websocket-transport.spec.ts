import { describe, it, expect, vi, afterEach } from "vitest";
import { Server } from "mock-socket";
import { webSocketTransport } from "./websocket-transport";

const servers: Server[] = [];
const transports: { disconnect?: () => void }[] = [];

afterEach(() => {
  while (servers.length) servers.shift()?.stop();
  while (transports.length) transports.shift()?.disconnect?.();
});

describe("webSocketTransport", () => {
  it("sends a subscribe frame on subscribe()", async () => {
    const url = "ws://localhost:4000/realtime";
    const server = new Server(url);
    servers.push(server);
    const received: unknown[] = [];
    server.on("connection", (socket) => {
      socket.on("message", (data) => {
        received.push(JSON.parse(String(data)));
      });
    });
    const t = webSocketTransport({
      url,
      heartbeatMs: 0,
      reconnect: { enabled: false },
    });
    transports.push(t);
    t.subscribe("resource/posts", vi.fn());
    await new Promise((r) => setTimeout(r, 30));
    expect(received).toContainEqual({ op: "subscribe", topic: "resource/posts" });
  });

  it("dispatches incoming events to subscribers", async () => {
    const url = "ws://localhost:4001/realtime";
    const server = new Server(url);
    servers.push(server);
    server.on("connection", (socket) => {
      socket.on("message", () => {
        socket.send(
          JSON.stringify({
            topic: "resource/posts",
            type: "created",
            payload: { ids: [1] },
          })
        );
      });
    });
    const t = webSocketTransport({
      url,
      heartbeatMs: 0,
      reconnect: { enabled: false },
    });
    transports.push(t);
    const cb = vi.fn();
    t.subscribe("resource/posts", cb);
    await new Promise((r) => setTimeout(r, 60));
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ topic: "resource/posts", type: "created" })
    );
  });

  it("publishes a publish frame", async () => {
    const url = "ws://localhost:4002/realtime";
    const server = new Server(url);
    servers.push(server);
    const received: unknown[] = [];
    server.on("connection", (socket) => {
      socket.on("message", (data) => received.push(JSON.parse(String(data))));
    });
    const t = webSocketTransport({
      url,
      heartbeatMs: 0,
      reconnect: { enabled: false },
    });
    transports.push(t);
    t.subscribe("resource/posts", vi.fn());
    await new Promise((r) => setTimeout(r, 30));
    await t.publish("resource/posts", { type: "created", payload: { ids: [1] } });
    await new Promise((r) => setTimeout(r, 30));
    expect(received).toContainEqual({
      op: "publish",
      topic: "resource/posts",
      event: { type: "created", payload: { ids: [1] } },
    });
  });
});
