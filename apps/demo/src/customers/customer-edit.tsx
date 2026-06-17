import { BooleanInput } from "shadmin/components/admin/inputs/boolean-input";
import { Edit } from "shadmin/components/admin/views/edit";
import { SimpleForm } from "shadmin/components/admin/form/simple-form";
import { TextInput } from "shadmin/components/admin/inputs/text-input";
import { PhoneInput } from "shadmin/components/extras/phone-input";
import { required } from "ra-core";

export const CustomerEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="first_name" validate={required()} />
      <TextInput source="last_name" validate={required()} />
      <TextInput source="email" validate={required()} />
      <PhoneInput source="phone" defaultCountry="US" />
      <BooleanInput source="has_ordered" />
      <TextInput multiline source="notes" />
    </SimpleForm>
  </Edit>
);
