import {
  AutocompleteArrayInput,
  Edit,
  NumberInput,
  ReferenceArrayInput,
  SimpleForm,
  TextInput,
} from "shadmin/components/admin";
import { email, required } from "shadmin-core";

/** Customers edit — identity, contact, spend, and tags. */
export const CustomersEdit = () => (
  <Edit>
    <SimpleForm className="max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <TextInput source="first_name" validate={required()} />
        <TextInput source="last_name" validate={required()} />
      </div>
      <TextInput source="email" validate={[required(), email()]} />
      <NumberInput source="total_spent" />
      <ReferenceArrayInput source="tag_ids" reference="tags">
        <AutocompleteArrayInput label="Tags" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
);
