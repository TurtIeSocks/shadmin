import { Create, SimpleForm, TextInput } from "@/components/admin";
import { CronInput } from "@/components/extras/cron-input";

export const ScheduledJobCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput multiline source="description" />
      <CronInput source="cron" />
    </SimpleForm>
  </Create>
);
