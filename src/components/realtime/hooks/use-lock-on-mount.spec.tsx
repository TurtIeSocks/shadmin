import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { ResourceContextProvider, RecordContextProvider } from "ra-core";
import { RealtimeStoryAdmin } from "@/stories/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { inMemoryLockProvider } from "@/components/realtime/transports/in-memory-lock-provider";
import { useLockOnMount } from "./use-lock-on-mount";

function Probe() {
  const { lock, lockError } = useLockOnMount({ identity: "alice" });
  if (lockError) return <div data-testid="state">conflict</div>;
  if (lock) return <div data-testid="state">held:{String(lock.identity)}</div>;
  return <div data-testid="state">pending</div>;
}

describe("useLockOnMount", () => {
  it("acquires a lock on mount when free", async () => {
    const transport = fakeTransport();
    const locks = inMemoryLockProvider({ publisher: transport });
    const screen = render(
      <RealtimeStoryAdmin transport={transport} locks={locks}>
        <ResourceContextProvider value="posts">
          <RecordContextProvider value={{ id: 1 }}>
            <Probe />
          </RecordContextProvider>
        </ResourceContextProvider>
      </RealtimeStoryAdmin>
    );
    await expect
      .element(screen.getByTestId("state"))
      .toHaveTextContent("held:alice");
  });

  it("surfaces a conflict when another identity holds the lock", async () => {
    const transport = fakeTransport();
    const locks = inMemoryLockProvider({ publisher: transport });
    await locks.lock("posts", { id: 1, identity: "bob" });
    const screen = render(
      <RealtimeStoryAdmin transport={transport} locks={locks}>
        <ResourceContextProvider value="posts">
          <RecordContextProvider value={{ id: 1 }}>
            <Probe />
          </RecordContextProvider>
        </ResourceContextProvider>
      </RealtimeStoryAdmin>
    );
    await expect.element(screen.getByTestId("state")).toHaveTextContent("conflict");
  });
});
