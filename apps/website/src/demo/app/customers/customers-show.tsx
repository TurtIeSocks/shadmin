import {
  EmailField,
  NumberField,
  ReferenceArrayField,
  Show,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
} from "shadmin/components/admin";

/** Customers show — identity, contact, spend, location, and tags. */
export const CustomersShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="first_name" />
      <TextField source="last_name" />
      <EmailField source="email" />
      <NumberField
        source="total_spent"
        options={{ style: "currency", currency: "USD" }}
      />
      <NumberField source="latitude" />
      <NumberField source="longitude" />
      <ReferenceArrayField source="tag_ids" reference="tags">
        <SingleFieldList />
      </ReferenceArrayField>
    </SimpleShowLayout>
  </Show>
);
