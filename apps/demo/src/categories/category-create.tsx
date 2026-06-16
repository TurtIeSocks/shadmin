import { Create, SimpleForm, TextInput } from "shadmin/components/admin";
import { required } from "ra-core";

export const CategoryCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput source="name" label="Name" validate={required()} />
    </SimpleForm>
  </Create>
);
