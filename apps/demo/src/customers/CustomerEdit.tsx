import { BooleanInput } from "shadcn-admin-kit/components/admin/boolean-input";
import { Edit } from "shadcn-admin-kit/components/admin/edit";
import { SimpleForm } from "shadcn-admin-kit/components/admin/simple-form";
import { TextInput } from "shadcn-admin-kit/components/admin/text-input";
import { PhoneInput } from "shadcn-admin-kit/components/extras/phone-input";
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
