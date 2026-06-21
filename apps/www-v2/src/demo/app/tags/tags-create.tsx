import {
  ColorInput,
  Create,
  SimpleForm,
  TextInput,
} from "shadmin/components/admin";
import { required } from "shadmin-core";

/** Tags create — name and color picker. */
export const TagsCreate = () => (
  <Create>
    <SimpleForm className="max-w-xl">
      <TextInput source="name" validate={required()} />
      <ColorInput source="color" />
    </SimpleForm>
  </Create>
);
