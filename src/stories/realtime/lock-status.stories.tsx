import { ResourceContextProvider, RecordContextProvider } from "ra-core";
import { RealtimeStoryAdmin } from "@/stories/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { inMemoryLockProvider } from "@/components/realtime/transports/in-memory-lock-provider";
import { LockStatus } from "@/components/realtime/lock-status";

export const lsTransport = fakeTransport();
export const lsLocks = inMemoryLockProvider({ publisher: lsTransport });
// Pre-lock so the test can assert the held UI.
lsLocks.lock("posts", { id: 1, identity: "alice" });

export default { title: "realtime/LockStatus" };

export const Held = () => (
  <RealtimeStoryAdmin transport={lsTransport} locks={lsLocks}>
    <ResourceContextProvider value="posts">
      <RecordContextProvider value={{ id: 1 }}>
        <LockStatus />
      </RecordContextProvider>
    </ResourceContextProvider>
  </RealtimeStoryAdmin>
);
