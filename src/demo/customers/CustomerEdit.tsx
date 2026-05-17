import { BooleanInput } from "@/components/admin/boolean-input";
import { Edit } from "@/components/admin/edit";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { PhoneInput } from "@/components/extras/phone-input";
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
