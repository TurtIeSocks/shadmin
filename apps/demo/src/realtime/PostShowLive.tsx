import { SimpleShowLayout, TextField } from "shadcn-admin-kit/components/admin";
import { ShowLive, LockStatus } from "shadcn-admin-kit/components/realtime";

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
