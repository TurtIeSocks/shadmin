import {
  List,
  DataTable,
  TextField,
  DateField,
  BooleanField,
} from "shadmin/components/admin";

export default function DataTableColumnsExample() {
  return (
    <List resource="orders" disableSyncWithLocation>
      <DataTable>
        <DataTable.Col source="id" disableSort />
        <DataTable.Col source="reference" label="Order Ref" />
        <DataTable.Col source="status">
          <TextField source="status" />
        </DataTable.Col>
        <DataTable.Col source="date" label="Date">
          <DateField source="date" />
        </DataTable.Col>
        <DataTable.Col source="returned" label="Returned">
          <BooleanField source="returned" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
