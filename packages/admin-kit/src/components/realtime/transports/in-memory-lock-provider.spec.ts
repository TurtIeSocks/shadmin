import { describe, it, expect } from "vitest";
import { inMemoryLockProvider } from "./in-memory-lock-provider";
import { fakeTransport } from "./fake-transport";
import { LockConflictError } from "../types";

describe("inMemoryLockProvider", () => {
  it("locks an unlocked record", async () => {
    const lp = inMemoryLockProvider();
    const lock = await lp.lock("posts", { id: 1, identity: "alice" });
    expect(lock).toMatchObject({
      resource: "posts",
      recordId: 1,
      identity: "alice",
    });
  });

  it("throws LockConflictError when another identity holds the lock", async () => {
    const lp = inMemoryLockProvider();
    await lp.lock("posts", { id: 1, identity: "alice" });
    await expect(
      lp.lock("posts", { id: 1, identity: "bob" }),
    ).rejects.toBeInstanceOf(LockConflictError);
  });

  it("is idempotent when re-locked by the same identity", async () => {
    const lp = inMemoryLockProvider();
    const a = await lp.lock("posts", { id: 1, identity: "alice" });
    const b = await lp.lock("posts", { id: 1, identity: "alice" });
    expect(b.createdAt).toBe(a.createdAt);
  });

  it("unlocks", async () => {
    const lp = inMemoryLockProvider();
    await lp.lock("posts", { id: 1, identity: "alice" });
    await lp.unlock("posts", { id: 1, identity: "alice" });
    expect(await lp.getLock("posts", { id: 1 })).toBeNull();
  });

  it("publishes locked/unlocked events through the configured publisher", async () => {
    const transport = fakeTransport();
    const lp = inMemoryLockProvider({ publisher: transport });
    await lp.lock("posts", { id: 1, identity: "alice" });
    await lp.unlock("posts", { id: 1, identity: "alice" });
    const types = transport.publishedEvents.map((e) => e.event.type);
    expect(types).toContain("locked");
    expect(types).toContain("unlocked");
  });

  it("getLocks returns all locks for the resource", async () => {
    const lp = inMemoryLockProvider();
    await lp.lock("posts", { id: 1, identity: "alice" });
    await lp.lock("posts", { id: 2, identity: "bob" });
    const all = await lp.getLocks("posts");
    expect(all).toHaveLength(2);
  });
});
