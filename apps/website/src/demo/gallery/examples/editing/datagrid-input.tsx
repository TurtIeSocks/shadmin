import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { DataTable, DatagridInput, SimpleForm } from "shadmin/components/admin";

const users = [
  { id: 1, name: "Ada Lovelace", role: "Engineer" },
  { id: 2, name: "Alan Turing", role: "Researcher" },
  { id: 3, name: "Grace Hopper", role: "Engineer" },
];

export default function DatagridInputExample() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider value={{ id: 1, members: [1, 3] }}>
        <SimpleForm toolbar={false}>
          <DatagridInput source="members" choices={users}>
            <DataTable.Col source="name" />
            <DataTable.Col source="role" />
          </DatagridInput>
        </SimpleForm>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
