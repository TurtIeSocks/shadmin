import {
  ColorField,
  CreateButton,
  DataTable,
  ExportButton,
  List,
  TextInput,
} from "shadmin/components/admin";

const filters = [
  <TextInput key="q" source="q" placeholder="Search" label={false} alwaysOn />,
];

/** Tags list — name and color swatch. */
export const TagsList = () => (
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
      <DataTable.Col source="color">
        <ColorField source="color" />
      </DataTable.Col>
    </DataTable>
  </List>
);
