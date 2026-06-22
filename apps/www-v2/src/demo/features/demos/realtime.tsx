import { useState } from "react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  useDataProvider,
  useNotify,
  useRefresh,
} from "shadmin-core";
import { DataTable } from "shadmin/components/admin";
import {
  ListLive,
  addEventsForMutations,
  broadcastChannelTransport,
  inMemoryLockProvider,
  realtimeDataProvider,
} from "shadmin/components/realtime";
import { Button } from "shadmin/components/ui/button";
import { localStorageDataProvider } from "../realtime-data/local-storage-data-provider";
import { realtimeSeed } from "../realtime-data/seed";

// One transport + provider per page load. Data lives in localStorage (shared
// across tabs); mutations broadcast over a BroadcastChannel so peer tabs
// invalidate and refetch — a real cross-tab live feed without a backend.
const transport = broadcastChannelTransport({
  channel: "shadmin-demo-realtime",
});
const locks = inMemoryLockProvider({ publisher: transport });
const baseDataProvider = realtimeDataProvider(
  localStorageDataProvider(realtimeSeed),
  transport,
  { locks },
);
const liveDataProvider = addEventsForMutations(
  baseDataProvider,
  baseDataProvider,
);

/** Mutating controls — create/rename a post to fire a cross-tab event. */
function PostControls() {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [n, setN] = useState(3);

  const addPost = () => {
    dataProvider
      .create("posts", {
        data: { title: `New post #${n}`, author: "you" },
      })
      .then(() => {
        setN((v) => v + 1);
        // BroadcastChannel doesn't echo to the sender, so refresh this tab
        // too; peer tabs update from the broadcast event.
        refresh();
        notify("Post created — peer tabs update live", { type: "info" });
      });
  };

  return (
    <Button onClick={addPost} size="sm">
      Add a post
    </Button>
  );
}

/**
 * Realtime feature — a live-updating posts list backed by a localStorage data
 * provider wrapped in shadmin's realtime transport. Runs under its own nested
 * CoreAdminContext so it can swap in the realtime provider without disturbing
 * the demo's fakerest one.
 */
export default function RealtimeDemo() {
  return (
    <CoreAdminContext dataProvider={liveDataProvider}>
      <ResourceContextProvider value="posts">
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            Open this page in <strong>two browser tabs</strong>, then add a post
            in one — the other list updates live, no refresh.
          </div>
          <PostControls />
          <ListLive>
            <DataTable>
              <DataTable.Col source="id" />
              <DataTable.Col source="title" />
              <DataTable.Col source="author" />
            </DataTable>
          </ListLive>
        </div>
      </ResourceContextProvider>
    </CoreAdminContext>
  );
}
