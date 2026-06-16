import { SimpleShowLayout, TextField } from "shadmin/components/admin";
import { ShowLive, LockStatus } from "shadmin/components/realtime";

export function PostShowLive() {
  return (
    <ShowLive>
      <SimpleShowLayout>
        <TextField source="title" />
        <TextField source="body" />
        <TextField source="author" />
        <LockStatus />
      </SimpleShowLayout>
    </ShowLive>
  );
}
