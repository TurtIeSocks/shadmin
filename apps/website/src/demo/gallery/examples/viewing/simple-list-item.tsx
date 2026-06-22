import { SimpleListItem } from "shadmin/components/admin";

export default function SimpleListItemExample() {
  return (
    <ul className="rounded-md border divide-y">
      <SimpleListItem
        record={{
          id: 1,
          first_name: "Jane",
          last_name: "Doe",
          email: "jane@example.com",
        }}
        resource="customers"
        linkType={false}
      >
        <span className="font-medium">Jane Doe</span>
        <span className="text-muted-foreground text-sm ml-2">
          jane@example.com
        </span>
      </SimpleListItem>
      <SimpleListItem
        record={{
          id: 2,
          first_name: "John",
          last_name: "Smith",
          email: "john@example.com",
        }}
        resource="customers"
        linkType={false}
      >
        <span className="font-medium">John Smith</span>
        <span className="text-muted-foreground text-sm ml-2">
          john@example.com
        </span>
      </SimpleListItem>
    </ul>
  );
}
