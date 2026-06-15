import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { inMemoryLockProvider } from "@/components/realtime/transports/in-memory-lock-provider";
import { useGetLock } from "./use-get-lock";

function LockProbe() {
  const { data, isPending } = useGetLock("posts", { id: 1 });
  if (isPending) return <div data-testid="lock">loading</div>;
  return <div data-testid="lock">{data?.identity ?? "free"}</div>;
}

describe("useGetLock", () => {
  it("returns the current lock", async () => {
    const transport = fakeTransport();
    const locks = inMemoryLockProvider({ publisher: transport });
    await locks.lock("posts", { id: 1, identity: "alice" });

    const screen = render(
      <RealtimeStoryAdmin transport={transport} locks={locks}>
        <LockProbe />
      </RealtimeStoryAdmin>,
    );
    await expect.element(screen.getByTestId("lock")).toHaveTextContent("alice");
  });
});
