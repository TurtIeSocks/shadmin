import { required } from "ra-core";
import { Create, SimpleForm, TextInput } from "shadmin/components/admin";

export const WorkspaceCreate = () => (
  <Create>
    <SimpleForm
      defaultValues={{
        body: "",
        collaborators: [],
        permissions: [],
      }}
    >
      <TextInput source="title" validate={required()} />
      <TextInput
        source="body"
        multiline
        rows={10}
        helperText="Supports Markdown. Add collaborators and permissions after creating."
      />
    </SimpleForm>
  </Create>
);
