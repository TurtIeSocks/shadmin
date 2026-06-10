import { ResourceContextProvider, RecordContextProvider } from "ra-core";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { LockStatus } from "@/components/realtime/lock-status";
import { lsTransport, lsLocks } from "./__fixtures__/lock-status-fixtures";

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
