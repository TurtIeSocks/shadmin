import { RecordContextProvider, Form } from "shadmin-core";
import { DatagridInput, DataTable } from "shadmin/components/admin";

const users = [
  { id: 1, name: "Ada Lovelace", role: "Engineer" },
  { id: 2, name: "Alan Turing", role: "Researcher" },
  { id: 3, name: "Grace Hopper", role: "Engineer" },
];

export default function DatagridInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, members: [1, 3] }}>
      <Form>
        <DatagridInput source="members" choices={users}>
          <DataTable.Col source="name" />
          <DataTable.Col source="role" />
        </DatagridInput>
      </Form>
    </RecordContextProvider>
  );
}
