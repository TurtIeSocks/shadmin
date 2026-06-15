import { DataTable, List } from "shadmin/components/admin";
import { CronField } from "shadmin/components/extras/cron-field";

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
