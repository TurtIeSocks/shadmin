import {
  CreateButton,
  DataTable,
  EmailField,
  ExportButton,
  List,
  ReferenceArrayField,
  SingleFieldList,
  TextInput,
} from "shadmin/components/admin";

const filters = [
  <TextInput key="q" source="q" placeholder="Search" label={false} alwaysOn />,
];

/**
 * Customers list — name, email, total spent (currency), and the customer's tags
 * resolved from the tags resource.
 */
export const CustomersList = () => (
  <List
    sort={{ field: "last_name", order: "ASC" }}
    filters={filters}
    perPage={25}
    actions={
      <div className="flex items-center gap-2">
        <CreateButton />
        <ExportButton />
      </div>
    }
  >
    <DataTable>
      <DataTable.Col source="first_name" />
      <DataTable.Col source="last_name" />
      <DataTable.Col source="email" className="hidden md:table-cell">
        <EmailField source="email" />
      </DataTable.Col>
      <DataTable.NumberCol
        source="total_spent"
        options={{ style: "currency", currency: "USD" }}
        className="text-right"
      />
      <DataTable.Col
        source="tag_ids"
        label="Tags"
        className="hidden lg:table-cell"
      >
        <ReferenceArrayField source="tag_ids" reference="tags">
          <SingleFieldList />
        </ReferenceArrayField>
      </DataTable.Col>
    </DataTable>
  </List>
);
