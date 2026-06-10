import {
  CreateButton,
  DataTable,
  ExportButton,
  List,
  TextInput,
} from "shadcn-admin-kit/components/admin";
import type { WorkspaceDocument } from "./documents-seed";

const filters = [
  <TextInput key="q" source="q" placeholder="Search" label={false} alwaysOn />,
];

const CollaboratorCount = () => {
  return (
    <DataTable.Col<WorkspaceDocument>
      source="collaborators"
      label="Collaborators"
      disableSort
      render={(record) => record.collaborators?.length ?? 0}
    />
  );
};

export const WorkspaceList = () => (
  <List
    sort={{ field: "title", order: "ASC" }}
    perPage={25}
    filters={filters}
    actions={
      <div className="flex items-center gap-2">
        <CreateButton />
        <ExportButton />
      </div>
    }
  >
    <DataTable rowClick="show">
      <DataTable.Col source="id" label="ID" className="hidden md:table-cell" />
      <DataTable.Col source="title" />
      <CollaboratorCount />
    </DataTable>
  </List>
);
