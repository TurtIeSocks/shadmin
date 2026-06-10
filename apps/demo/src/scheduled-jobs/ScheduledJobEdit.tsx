import { Edit, SelectInput, SimpleForm, TextInput } from "shadcn-admin-kit/components/admin";
import { CronInput } from "shadcn-admin-kit/components/extras/cron-input";

export const ScheduledJobEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput multiline source="description" />
      <CronInput source="cron" />
      <SelectInput
        source="status"
        choices={[
          { id: "running", name: "Running" },
          { id: "idle", name: "Idle" },
          { id: "failed", name: "Failed" },
          { id: "disabled", name: "Disabled" },
        ]}
      />
    </SimpleForm>
  </Edit>
);
