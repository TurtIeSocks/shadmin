import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useEffect } from "react";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "shadmin-core";
import { inMemoryLockProvider } from "shadmin-core";
import { useLock } from "shadmin-core";

function LockOnce({ onSuccess }: { onSuccess: (lock: unknown) => void }) {
  const { lock, isLoading } = useLock();
  useEffect(() => {
    if (isLoading) return;
    lock("posts", { id: 1, identity: "alice" }).then(onSuccess);
  }, [lock, isLoading, onSuccess]);
  return null;
}

describe("useLock", () => {
  it("locks via the configured provider", async () => {
    const transport = fakeTransport();
    const locks = inMemoryLockProvider({ publisher: transport });
    const onSuccess = vi.fn();
    render(
      <RealtimeStoryAdmin transport={transport} locks={locks}>
        <LockOnce onSuccess={onSuccess} />
      </RealtimeStoryAdmin>,
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ identity: "alice", resource: "posts" }),
    );
  });
});
