import {
  List,
  DataTable,
  NumberField,
  ColumnsButton,
  ExportButton,
} from "shadmin/components/admin";

export default function DataTableAdvancedExample() {
  return (
    <List
      resource="orders"
      disableSyncWithLocation
      actions={
        <div className="flex gap-2">
          <ColumnsButton />
          <ExportButton />
        </div>
      }
    >
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
        <DataTable.Col source="total_ex_taxes" label="Total">
          <NumberField
            source="total_ex_taxes"
            options={{ style: "currency", currency: "USD" }}
          />
        </DataTable.Col>
        <DataTable.Col source="nb_products" label="Items" />
      </DataTable>
    </List>
  );
}
