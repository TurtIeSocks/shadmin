import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { inMemoryLockProvider } from "@/components/realtime/transports/in-memory-lock-provider";
import { useGetLocks } from "./use-get-locks";

function LocksProbe() {
  const { data, isPending } = useGetLocks("posts");
  if (isPending) return <div data-testid="count">loading</div>;
  return <div data-testid="count">{data?.length ?? 0}</div>;
}

describe("useGetLocks", () => {
  it("returns all locks for the resource", async () => {
    const transport = fakeTransport();
    const locks = inMemoryLockProvider({ publisher: transport });
    await locks.lock("posts", { id: 1, identity: "alice" });
    await locks.lock("posts", { id: 2, identity: "bob" });

    const screen = render(
      <RealtimeStoryAdmin transport={transport} locks={locks}>
        <LocksProbe />
      </RealtimeStoryAdmin>
    );
    await expect.element(screen.getByTestId("count")).toHaveTextContent("2");
  });
});
