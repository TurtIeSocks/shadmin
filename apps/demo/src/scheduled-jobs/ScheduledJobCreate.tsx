import {
  Create,
  SimpleForm,
  TextInput,
} from "shadcn-admin-kit/components/admin";
import { CronInput } from "shadcn-admin-kit/components/extras/cron-input";

export const ScheduledJobCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput multiline source="description" />
      <CronInput source="cron" />
    </SimpleForm>
  </Create>
);
