import { ResourceContextProvider, RecordContextProvider } from "ra-core";
import { RealtimeStoryAdmin } from "@/stories/_test-helpers";
import { LockStatus } from "@/components/realtime/lock-status";
import { lsTransport, lsLocks } from "./lock-status-fixtures";

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
