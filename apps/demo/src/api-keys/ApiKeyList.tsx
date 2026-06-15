import { DataTable, List } from "shadmin/components/admin";
import { ApiKeyField } from "shadmin/components/extras/api-key-field";

export const ApiKeyList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="name" />
      <DataTable.Col label="Key" source="key">
        <ApiKeyField source="key" />
      </DataTable.Col>
      <DataTable.Col source="created_at" />
      <DataTable.Col source="last_used" />
    </DataTable>
  </List>
);
