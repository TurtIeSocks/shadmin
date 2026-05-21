import { Resource } from "ra-core";
import { Admin } from "@/components/admin";
import { DataTable } from "@/components/admin/data-table";
import { ListLive } from "@/components/realtime/list-live";
import { basicDataProvider } from "./list-live-fixtures";

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
