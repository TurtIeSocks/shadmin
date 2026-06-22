import {
  DateField,
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from "shadmin/components/admin";

export default function Example() {
  return (
    <Show resource="orders" id={1}>
      <SimpleShowLayout>
        <TextField source="reference" />
        <ReferenceField source="customer_id" reference="customers" />
        <DateField source="date" showTime />
        <TextField source="status" />
        <NumberField
          source="total"
          options={{ style: "currency", currency: "USD" }}
        />
      </SimpleShowLayout>
    </Show>
  );
}
