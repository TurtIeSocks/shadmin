import {
  AutocompleteInput,
  ColorInput,
  Create,
  ReferenceInput,
  SimpleForm,
  TextInput,
} from "shadmin/components/admin";
import { required } from "shadmin-core";

/** Categories create — name, optional parent, and a color picker. */
export const CategoriesCreate = () => (
  <Create>
    <SimpleForm className="max-w-xl">
      <TextInput source="name" validate={required()} />
      <ReferenceInput
        source="parent_id"
        reference="categories"
        sort={{ field: "name", order: "ASC" }}
      >
        <AutocompleteInput label="Parent category" />
      </ReferenceInput>
      <ColorInput source="color" />
    </SimpleForm>
  </Create>
);
