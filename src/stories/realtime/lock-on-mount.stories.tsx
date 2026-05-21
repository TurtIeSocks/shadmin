import { ResourceContextProvider, RecordContextProvider } from "ra-core";
import { RealtimeStoryAdmin } from "@/stories/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { inMemoryLockProvider } from "@/components/realtime/transports/in-memory-lock-provider";
import { LockOnMount } from "@/components/realtime/lock-on-mount";

export const lomTransport = fakeTransport();
export const lomLocks = inMemoryLockProvider({ publisher: lomTransport });

export default { title: "realtime/LockOnMount" };

export const Free = () => (
  <RealtimeStoryAdmin transport={lomTransport} locks={lomLocks}>
    <ResourceContextProvider value="posts">
      <RecordContextProvider value={{ id: 1 }}>
        <LockOnMount>
          <div data-testid="protected">protected content</div>
        </LockOnMount>
      </RecordContextProvider>
    </ResourceContextProvider>
  </RealtimeStoryAdmin>
);
