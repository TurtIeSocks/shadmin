import {
  AutocompleteInput,
  CreateButton,
  DataTable,
  ExportButton,
  List,
  RatingField,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  TextInput,
} from "shadmin/components/admin";

const STATUS_CHOICES = [
  { id: "draft", name: "Draft" },
  { id: "active", name: "Active" },
  { id: "archived", name: "Archived" },
];

const filters = [
  <TextInput key="q" source="q" placeholder="Search" label={false} alwaysOn />,
  <ReferenceInput
    key="category_id"
    source="category_id"
    reference="categories"
  >
    <AutocompleteInput placeholder="Category" label={false} />
  </ReferenceInput>,
  <SelectInput key="status" source="status" choices={STATUS_CHOICES} />,
];

/**
 * Products list — reference, category reference, price, stock, status, and a
 * star rating.
 */
export const ProductsList = () => (
  <List
    sort={{ field: "reference", order: "ASC" }}
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
      <DataTable.Col source="reference" />
      <DataTable.Col
        source="category_id"
        label="Category"
        className="hidden md:table-cell"
      >
        <ReferenceField source="category_id" reference="categories" />
      </DataTable.Col>
      <DataTable.NumberCol
        source="price"
        options={{ style: "currency", currency: "USD" }}
        className="text-right"
      />
      <DataTable.NumberCol source="stock" className="hidden md:table-cell" />
      <DataTable.Col source="status" className="hidden md:table-cell" />
      <DataTable.Col source="rating" className="hidden lg:table-cell">
        <RatingField source="rating" />
      </DataTable.Col>
    </DataTable>
  </List>
);
