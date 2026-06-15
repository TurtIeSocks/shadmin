import { Resource } from "ra-core";
import { Admin } from "shadmin/components/admin";
import {
  realtimeDataProvider,
  addEventsForMutations,
  broadcastChannelTransport,
  inMemoryLockProvider,
} from "shadmin/components/realtime";
import { realtimeSeed } from "./realtime/seed";
import { localStorageDataProvider } from "./realtime/local-storage-data-provider";
import { PostListLive } from "./realtime/PostListLive";
import { PostEditLive } from "./realtime/PostEditLive";
import { PostShowLive } from "./realtime/PostShowLive";

const transport = broadcastChannelTransport({
  channel: "shadcn-admin-realtime-demo",
});
const locks = inMemoryLockProvider({ publisher: transport });
const baseDP = realtimeDataProvider(
  localStorageDataProvider(realtimeSeed),
  transport,
  { locks },
);
const dataProvider = addEventsForMutations(baseDP, baseDP);

const fakeAuthProvider = {
  login: async () => undefined,
  logout: async () => undefined,
  checkAuth: async () => undefined,
  checkError: async () => undefined,
  getPermissions: async () => undefined,
  getIdentity: async () => ({ id: "alice", fullName: "Alice (demo)" }),
};

export function App() {
  return (
    <Admin dataProvider={dataProvider} authProvider={fakeAuthProvider}>
      <Resource
        name="posts"
        list={PostListLive}
        edit={PostEditLive}
        show={PostShowLive}
      />
    </Admin>
  );
}

export default App;
