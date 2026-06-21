import {
  AutocompleteInput,
  DateInput,
  Edit,
  NumberInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
} from "shadmin/components/admin";
import { required } from "shadmin-core";

const STATUS_CHOICES = [
  { id: "ordered", name: "Ordered" },
  { id: "delivered", name: "Delivered" },
  { id: "cancelled", name: "Cancelled" },
];

export default function Example() {
  return (
    <Edit resource="orders" id={1} mutationMode="optimistic" redirect="list">
      <SimpleForm className="max-w-xl">
        <TextInput source="reference" validate={required()} />
        <ReferenceInput source="customer_id" reference="customers">
          <AutocompleteInput label="Customer" validate={required()} />
        </ReferenceInput>
        <DateInput source="date" />
        <SelectInput source="status" choices={STATUS_CHOICES} />
        <NumberInput source="total" />
      </SimpleForm>
    </Edit>
  );
}
