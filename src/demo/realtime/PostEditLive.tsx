import { SimpleForm, TextInput } from "@/components/admin";
import { EditLive, LockOnMount } from "@/components/realtime";

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
