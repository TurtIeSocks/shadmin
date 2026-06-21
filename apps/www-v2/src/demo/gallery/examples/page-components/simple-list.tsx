import { List, SimpleList } from "shadmin/components/admin";

export default function Example() {
  return (
    <List resource="orders" sort={{ field: "date", order: "DESC" }}>
      <SimpleList
        primaryText={(record) => record.reference as string}
        secondaryText={(record) => record.status as string}
        tertiaryText={(record) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(record.total as number)
        }
      />
    </List>
  );
}
