import {
  DateField,
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from "shadmin/components/admin";

/** Orders show — key order fields plus the resolved customer. */
export const OrdersShow = () => (
  <Show>
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
