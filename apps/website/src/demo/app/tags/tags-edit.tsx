import {
  ColorInput,
  Edit,
  SimpleForm,
  TextInput,
} from "shadmin/components/admin";
import { required } from "shadmin-core";

/** Tags edit — name and color picker. */
export const TagsEdit = () => (
  <Edit>
    <SimpleForm className="max-w-xl">
      <TextInput source="name" validate={required()} />
      <ColorInput source="color" />
    </SimpleForm>
  </Edit>
);
