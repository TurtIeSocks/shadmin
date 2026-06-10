import { SimpleForm, TextInput } from "shadcn-admin-kit/components/admin";
import { EditLive, LockOnMount } from "shadcn-admin-kit/components/realtime";

export function PostEditLive() {
  return (
    <EditLive>
      <LockOnMount>
        <SimpleForm>
          <TextInput source="title" />
          <TextInput source="body" multiline />
          <TextInput source="author" />
        </SimpleForm>
      </LockOnMount>
    </EditLive>
  );
}
