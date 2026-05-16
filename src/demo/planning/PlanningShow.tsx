import {
  DateField,
  RecordField,
  Show,
  TextField,
} from "@/components/admin";

export const PlanningShow = () => (
  <Show>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <RecordField source="title">
        <TextField source="title" />
      </RecordField>
      <RecordField source="status">
        <TextField source="status" />
      </RecordField>
      <RecordField source="assignee">
        <TextField source="assignee" />
      </RecordField>
      <RecordField source="priority">
        <TextField source="priority" />
      </RecordField>
      <RecordField source="dueDate">
        <DateField source="dueDate" />
      </RecordField>
      <RecordField source="description" className="sm:col-span-2">
        <TextField source="description" />
      </RecordField>
    </div>
  </Show>
);
