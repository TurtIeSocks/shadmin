import {
  BooleanField,
  CreateButton,
  DataTable,
  DeleteButton,
  ExportButton,
  List,
  ListPagination,
} from "@/components/admin";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export const OnboardingList = () => (
  <List
    perPage={25}
    sort={{ field: "startedAt", order: "DESC" }}
    pagination={false}
    actions={
      <div className="flex items-center gap-2">
        <CreateButton />
        <ExportButton />
      </div>
    }
  >
    <DataTable
      rowClick="show"
      bulkActionButtons={<DeleteButton mutationMode="optimistic" />}
    >
      <DataTable.Col source="user" />
      <DataTable.Col source="email" />
      <DataTable.Col
        source="currentStep"
        className="text-right"
        render={(record) => `${record.currentStep} / 3`}
      />
      <DataTable.Col source="completed">
        <BooleanField source="completed" />
      </DataTable.Col>
      <DataTable.Col
        source="startedAt"
        render={(record) => dateFormatter.format(new Date(record.startedAt))}
      />
      <DataTable.Col source="timezone" className="hidden md:table-cell" />
    </DataTable>
    <ListPagination className="justify-start mt-2" />
  </List>
);
