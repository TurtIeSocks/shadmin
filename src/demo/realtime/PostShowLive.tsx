import { SimpleShowLayout, TextField } from "@/components/admin";
import { ShowLive, LockStatus } from "@/components/realtime";

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
