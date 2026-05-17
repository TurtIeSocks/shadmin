import {
  DateField,
  NumberField,
  Show,
  SimpleShowLayout,
  TextField,
} from "@/components/admin";
import { CronField } from "@/components/extras/cron-field";

export const ScheduledJobShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="description" />
      <CronField source="cron" />
      <TextField source="status" />
      <DateField source="last_run" showTime />
      <DateField source="next_run" showTime />
      <NumberField source="last_duration_ms" />
    </SimpleShowLayout>
  </Show>
);
