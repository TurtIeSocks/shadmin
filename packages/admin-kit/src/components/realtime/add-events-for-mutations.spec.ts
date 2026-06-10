import { describe, it, expect } from "vitest";
import fakeRestProvider from "ra-data-fakerest";
import { realtimeDataProvider } from "./realtime-data-provider";
import { fakeTransport } from "./transports/fake-transport";
import { addEventsForMutations } from "./add-events-for-mutations";

const buildStack = () => {
  const transport = fakeTransport();
  const baseDP = fakeRestProvider({ posts: [{ id: 1, title: "x" }] }, false);
  const realtimeDP = realtimeDataProvider(baseDP, transport);
  const dp = addEventsForMutations(realtimeDP, realtimeDP);
  return { transport, dp };
};

describe("addEventsForMutations", () => {
  it("publishes created event on create", async () => {
    const { transport, dp } = buildStack();
    await dp.create("posts", { data: { title: "new" } });
    expect(transport.publishedEvents).toContainEqual(
      expect.objectContaining({
        topic: "resource/posts",
        event: expect.objectContaining({ type: "created" }),
      })
    );
  });

  it("publishes updated event on both record + resource topics on update", async () => {
    const { transport, dp } = buildStack();
    await dp.update("posts", {
      id: 1,
      data: { title: "y" },
      previousData: { id: 1, title: "x" },
    });
    const topics = transport.publishedEvents.map((e) => e.topic);
    expect(topics).toContain("resource/posts/1");
    expect(topics).toContain("resource/posts");
  });

  it("publishes deleted event on delete", async () => {
    const { transport, dp } = buildStack();
    await dp.delete("posts", { id: 1, previousData: { id: 1, title: "x" } });
    const types = transport.publishedEvents.map((e) => e.event.type);
    expect(types).toEqual(expect.arrayContaining(["deleted"]));
  });

  it("publishes updated event on updateMany with all ids", async () => {
    const { transport, dp } = buildStack();
    await dp.updateMany("posts", { ids: [1], data: { title: "z" } });
    const updates = transport.publishedEvents.filter(
      (e) => e.event.type === "updated"
    );
    expect(updates).toHaveLength(1);
    expect(updates[0].topic).toBe("resource/posts");
  });

  it("publishes deleted event on deleteMany", async () => {
    const { transport, dp } = buildStack();
    await dp.deleteMany("posts", { ids: [1] });
    const deletes = transport.publishedEvents.filter(
      (e) => e.event.type === "deleted"
    );
    expect(deletes).toHaveLength(1);
    expect(deletes[0].topic).toBe("resource/posts");
  });
});
