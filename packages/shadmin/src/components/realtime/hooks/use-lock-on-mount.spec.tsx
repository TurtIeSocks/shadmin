import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { ResourceContextProvider, RecordContextProvider } from "shadmin-core";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "shadmin-core";
import { inMemoryLockProvider } from "shadmin-core";
import { useLockOnMount } from "shadmin-core";

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
      </RealtimeStoryAdmin>,
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
      </RealtimeStoryAdmin>,
    );
    await expect
      .element(screen.getByTestId("state"))
      .toHaveTextContent("conflict");
  });
});
