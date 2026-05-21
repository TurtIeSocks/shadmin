import { ResourceContextProvider, RecordContextProvider } from "ra-core";
import { RealtimeStoryAdmin } from "@/stories/_test-helpers";
import { LockOnMount } from "@/components/realtime/lock-on-mount";
import { lomTransport, lomLocks } from "./lock-on-mount-fixtures";

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
