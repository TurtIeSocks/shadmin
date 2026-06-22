import {
  InfiniteList,
  DataTable,
  InfinitePagination,
} from "shadmin/components/admin";

export default function InfinitePaginationExample() {
  return (
    <InfiniteList resource="orders" disableSyncWithLocation>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="reference" />
        <DataTable.Col source="status" />
      </DataTable>
      <InfinitePagination />
    </InfiniteList>
  );
}
