import { Resource } from "ra-core";
import fakeRestProvider from "ra-data-fakerest";
import { Admin } from "@/components/admin";
import { DataTable } from "@/components/admin/data-table";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { realtimeDataProvider } from "@/components/realtime/realtime-data-provider";
import { ListLive } from "@/components/realtime/list-live";

const seed = { posts: [{ id: 1, title: "alpha" }] };

export const basicTransport = fakeTransport();
export const basicDataProvider = realtimeDataProvider(
  fakeRestProvider(seed, false),
  basicTransport
);

export default { title: "realtime/ListLive" };

export const Basic = () => (
  <Admin dataProvider={basicDataProvider}>
    <Resource
      name="posts"
      list={() => (
        <ListLive>
          <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="title" />
          </DataTable>
        </ListLive>
      )}
    />
  </Admin>
);
