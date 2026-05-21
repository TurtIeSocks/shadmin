import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { RealtimeStoryAdmin } from "@/stories/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { inMemoryLockProvider } from "@/components/realtime/transports/in-memory-lock-provider";
import { useGetLockLive } from "./use-get-lock-live";

function LockLiveProbe() {
  const { data, isPending } = useGetLockLive("posts", { id: 1 });
  if (isPending) return <div data-testid="lock">loading</div>;
  return <div data-testid="lock">{data?.identity ?? "free"}</div>;
}

describe("useGetLockLive", () => {
  it("updates when a lock is released", async () => {
    const transport = fakeTransport();
    const locks = inMemoryLockProvider({ publisher: transport });
    await locks.lock("posts", { id: 1, identity: "alice" });

    const screen = render(
      <RealtimeStoryAdmin transport={transport} locks={locks}>
        <LockLiveProbe />
      </RealtimeStoryAdmin>
    );
    await expect.element(screen.getByTestId("lock")).toHaveTextContent("alice");

    await locks.unlock("posts", { id: 1, identity: "alice" });
    await expect.element(screen.getByTestId("lock")).toHaveTextContent("free");
  });
});
