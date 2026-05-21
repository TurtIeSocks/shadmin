import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useEffect } from "react";
import { RealtimeStoryAdmin } from "@/stories/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { inMemoryLockProvider } from "@/components/realtime/transports/in-memory-lock-provider";
import { useUnlock } from "./use-unlock";

function UnlockOnce({ onDone }: { onDone: () => void }) {
  const { unlock, isLoading } = useUnlock();
  useEffect(() => {
    if (isLoading) return;
    unlock("posts", { id: 1, identity: "alice" }).then(onDone, onDone);
  }, [unlock, isLoading, onDone]);
  return null;
}

describe("useUnlock", () => {
  it("releases a held lock", async () => {
    const transport = fakeTransport();
    const locks = inMemoryLockProvider({ publisher: transport });
    await locks.lock("posts", { id: 1, identity: "alice" });
    const onDone = vi.fn();
    render(
      <RealtimeStoryAdmin transport={transport} locks={locks}>
        <UnlockOnce onDone={onDone} />
      </RealtimeStoryAdmin>
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(onDone).toHaveBeenCalled();
    expect(await locks.getLock("posts", { id: 1 })).toBeNull();
  });
});
