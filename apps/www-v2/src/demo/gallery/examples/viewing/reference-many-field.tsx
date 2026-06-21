import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { ReferenceManyField, DataTable } from "shadmin/components/admin";

export default function ReferenceManyFieldExample() {
  return (
    <ResourceContextProvider value="customers">
      <RecordContextProvider
        value={{ id: 1, first_name: "Jane", last_name: "Doe" }}
      >
        <ReferenceManyField reference="orders" target="customer_id">
          <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="reference" />
            <DataTable.Col source="status" />
          </DataTable>
        </ReferenceManyField>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
