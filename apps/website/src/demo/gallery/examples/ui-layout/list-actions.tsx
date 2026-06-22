import {
  List,
  ListActions,
  CreateButton,
  ExportButton,
} from "shadmin/components/admin";

export default function Example() {
  return (
    <List resource="orders" disableSyncWithLocation actions={false}>
      <ListActions hasCreate>
        <CreateButton resource="orders" />
        <ExportButton resource="orders" />
      </ListActions>
    </List>
  );
}
