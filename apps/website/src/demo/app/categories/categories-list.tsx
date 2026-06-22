import {
  AutocompleteInput,
  ColorField,
  CreateButton,
  DataTable,
  ExportButton,
  List,
  ReferenceField,
  ReferenceInput,
  TextInput,
} from "shadmin/components/admin";

const filters = [
  <TextInput key="q" source="q" placeholder="Search" label={false} alwaysOn />,
  <ReferenceInput
    key="parent_id"
    source="parent_id"
    reference="categories"
    sort={{ field: "name", order: "ASC" }}
  >
    <AutocompleteInput placeholder="Parent category" label={false} />
  </ReferenceInput>,
];

/** Categories list — name, parent reference, and color swatch. */
export const CategoriesList = () => (
  <List
    sort={{ field: "name", order: "ASC" }}
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
      <DataTable.Col source="name" />
      <DataTable.Col
        source="parent_id"
        label="Parent"
        className="hidden md:table-cell"
      >
        <ReferenceField source="parent_id" reference="categories" />
      </DataTable.Col>
      <DataTable.Col source="color" className="hidden md:table-cell">
        <ColorField source="color" />
      </DataTable.Col>
    </DataTable>
  </List>
);
