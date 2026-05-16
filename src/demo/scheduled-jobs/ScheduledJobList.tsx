import { DataTable, List } from "@/components/admin";
import { CronField } from "@/components/extras/cron-field";

export const ScheduledJobList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="name" />
      <DataTable.Col label="Schedule">
        <CronField source="cron" />
      </DataTable.Col>
      <DataTable.Col source="status" />
      <DataTable.Col source="last_run" />
      <DataTable.Col source="next_run" />
    </DataTable>
  </List>
);
