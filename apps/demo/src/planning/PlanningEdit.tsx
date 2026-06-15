import {
  DateInput,
  Edit,
  SelectInput,
  SimpleForm,
  TextInput,
} from "shadmin/components/admin";
import { DurationInput } from "shadmin/components/extras/duration-input";
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

export const PlanningEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" validate={required()} />
      <TextInput source="description" multiline rows={3} />
      <SelectInput
        source="status"
        choices={STATUS_CHOICES}
        validate={required()}
      />
      <SelectInput
        source="priority"
        choices={PRIORITY_CHOICES}
        validate={required()}
      />
      <DateInput source="dueDate" validate={required()} />
      <DurationInput source="estimated_duration_minutes" units={["m", "h"]} />
      <TextInput source="assignee" validate={required()} />
    </SimpleForm>
  </Edit>
);
