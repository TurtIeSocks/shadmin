import {
  Create,
  DateInput,
  SelectInput,
  SimpleForm,
  TextInput,
} from "@/components/admin";
import { required } from "ra-core";

const STATUS_CHOICES = [
  { id: "todo", name: "To do" },
  { id: "doing", name: "In progress" },
  { id: "done", name: "Done" },
];

const PRIORITY_CHOICES = [
  { id: "low", name: "Low" },
  { id: "medium", name: "Medium" },
  { id: "high", name: "High" },
];

export const PlanningCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput source="title" validate={required()} />
      <TextInput source="description" multiline rows={3} />
      <SelectInput
        source="status"
        choices={STATUS_CHOICES}
        defaultValue="todo"
        validate={required()}
      />
      <SelectInput
        source="priority"
        choices={PRIORITY_CHOICES}
        defaultValue="medium"
        validate={required()}
      />
      <DateInput source="dueDate" validate={required()} />
      <TextInput source="assignee" validate={required()} />
    </SimpleForm>
  </Create>
);
