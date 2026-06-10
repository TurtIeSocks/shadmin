import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { inMemoryLockProvider } from "@/components/realtime/transports/in-memory-lock-provider";
import { useGetLocksLive } from "./use-get-locks-live";

function LocksLiveProbe() {
  const { data, isPending } = useGetLocksLive("posts");
  if (isPending) return <div data-testid="count">loading</div>;
  return <div data-testid="count">{data?.length ?? 0}</div>;
}

describe("useGetLocksLive", () => {
  it("updates when a lock is released", async () => {
    const transport = fakeTransport();
    const locks = inMemoryLockProvider({ publisher: transport });
    await locks.lock("posts", { id: 1, identity: "alice" });

    const screen = render(
      <RealtimeStoryAdmin transport={transport} locks={locks}>
        <LocksLiveProbe />
      </RealtimeStoryAdmin>
    );
    await expect.element(screen.getByTestId("count")).toHaveTextContent("1");

    await locks.unlock("posts", { id: 1, identity: "alice" });
    await expect.element(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
