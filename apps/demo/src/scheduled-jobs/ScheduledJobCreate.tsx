import {
  Create,
  SimpleForm,
  TextInput,
} from "shadmin/components/admin";
import { CronInput } from "shadmin/components/extras/cron-input";

export const ScheduledJobCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput multiline source="description" />
      <CronInput source="cron" />
    </SimpleForm>
  </Create>
);
