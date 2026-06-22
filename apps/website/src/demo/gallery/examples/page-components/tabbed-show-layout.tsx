import {
  DateField,
  NumberField,
  ReferenceField,
  Show,
  TabbedShowLayout,
  TextField,
} from "shadmin/components/admin";

export default function Example() {
  return (
    <Show resource="orders" id={1}>
      <TabbedShowLayout syncWithLocation={false}>
        <TabbedShowLayout.Tab label="Summary">
          <TextField source="reference" />
          <ReferenceField source="customer_id" reference="customers" />
          <TextField source="status" />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Details">
          <DateField source="date" showTime />
          <NumberField
            source="total"
            options={{ style: "currency", currency: "USD" }}
          />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}
