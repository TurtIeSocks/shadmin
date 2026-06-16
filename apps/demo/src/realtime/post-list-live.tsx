import { DataTable } from "shadmin/components/admin/data-table";
import { ListLive } from "shadmin/components/realtime";

export function PostListLive() {
  return (
    <ListLive>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="title" />
        <DataTable.Col source="author" />
      </DataTable>
    </ListLive>
  );
}
