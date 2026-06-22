import { List, ListToolbar, TextInput } from "shadmin/components/admin";

export default function Example() {
  return (
    <List resource="orders" disableSyncWithLocation actions={false}>
      <ListToolbar
        hasCreate
        filters={[<TextInput key="q" source="q" label="Search" alwaysOn />]}
      />
    </List>
  );
}
