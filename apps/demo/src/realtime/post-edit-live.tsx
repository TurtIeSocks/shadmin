import { SimpleForm, TextInput } from "shadmin/components/admin";
import { EditLive, LockOnMount } from "shadmin/components/realtime";

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
