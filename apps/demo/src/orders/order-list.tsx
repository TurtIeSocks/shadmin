import { useListContext } from "ra-core";
import {
  BulkDeleteButton,
  ColumnsButton,
  DataTable,
  ExportButton,
  List,
  ReferenceField,
  Count,
  SelectInput,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
} from "shadmin/components/admin";
import { BulkEditDrawer } from "shadmin/components/extras/bulk-edit-drawer";
import { CurrencyField } from "shadmin/components/extras/currency-field";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "shadmin/components/ui/tabs";
import { Badge } from "shadmin/components/ui/badge";

import { AddressField } from "../customers/address-field";
import { FullNameField } from "../customers/full-name-field";

const storeKeyByStatus = {
  ordered: "orders.list1",
  delivered: "orders.list2",
  cancelled: "orders.list3",
};

const ListActions = () => {
  const { filterValues } = useListContext();
  const status =
    (filterValues.status as "ordered" | "delivered" | "cancelled") ?? "ordered";
  return (
    <div className="flex items-center gap-2">
      <ColumnsButton storeKey={storeKeyByStatus[status]} />
      <ExportButton />
    </div>
  );
};

const filters = [
  <TextInput key="q" source="q" placeholder="Search" label={false} alwaysOn />,
  <ReferenceInput
    key="customer_id"
    source="customer_id"
    reference="customers"
    sort={{ field: "last_name", order: "ASC" }}
    alwaysOn
  >
    <AutocompleteInput placeholder="Filter by customer" label={false} />
  </ReferenceInput>,
];

export const OrderList = () => (
  <List
    sort={{ field: "date", order: "DESC" }}
    filterDefaultValues={{ status: "ordered" }}
    filters={filters}
    perPage={25}
    actions={<ListActions />}
    queryOptions={{ meta: { embed: ["customer"] } }}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  const handleChange = (value: string) => () => {
    setFilters({ ...filterValues, status: value }, displayedFilters);
  };
  return (
    <Tabs value={filterValues.status ?? "ordered"} className="mb-4 -gap-2">
      <TabsList className="w-full">
        <TabsTrigger value="ordered" onClick={handleChange("ordered")}>
          Ordered{" "}
          <Badge variant="outline" className="hidden md:inline-flex">
            <Count
              filter={{
                ...filterValues,
                status: "ordered",
              }}
            />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="delivered" onClick={handleChange("delivered")}>
          Delivered
          <Badge variant="outline" className="hidden md:inline-flex">
            <Count
              filter={{
                ...filterValues,
                status: "delivered",
              }}
            />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="cancelled" onClick={handleChange("cancelled")}>
          Cancelled{" "}
          <Badge variant="outline" className="hidden md:inline-flex">
            <Count
              filter={{
                ...filterValues,
                status: "cancelled",
              }}
            />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="ordered">
        <OrdersTable storeKey={storeKeyByStatus.ordered} />
      </TabsContent>
      <TabsContent value="delivered">
        <OrdersTable storeKey={storeKeyByStatus.delivered} />
      </TabsContent>
      <TabsContent value="cancelled">
        <OrdersTable storeKey={storeKeyByStatus.cancelled} />
      </TabsContent>
    </Tabs>
  );
};

const ORDER_STATUS_CHOICES = [
  { id: "ordered", name: "Ordered" },
  { id: "delivered", name: "Delivered" },
  { id: "cancelled", name: "Cancelled" },
];

const OrderBulkActions = () => (
  <>
    <BulkEditDrawer label="Edit status" title="Edit selected orders">
      <SelectInput source="status" choices={ORDER_STATUS_CHOICES} />
    </BulkEditDrawer>
    <BulkDeleteButton />
  </>
);

const OrdersTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable storeKey={storeKey} bulkActionButtons={<OrderBulkActions />}>
    <DataTable.Col
      source="date"
      render={(record) => new Date(record.date).toLocaleString()}
    />
    <DataTable.Col source="reference" className="hidden md:table-cell" />
    <DataTable.Col
      source="customer.last_name"
      label="resources.orders.fields.customer_id"
      className="hidden md:table-cell"
    >
      <ReferenceField source="customer_id" reference="customers" link={false}>
        <FullNameField />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.NumberCol
      source="basket.length"
      label="resources.orders.fields.nb_items"
      className="hidden md:table-cell"
    />
    <DataTable.Col
      source="total"
      headerClassName="text-right"
      cellClassName="text-right"
    >
      <CurrencyField source="total" currency="USD" />
    </DataTable.Col>
    <DataTable.Col
      label="resources.orders.fields.address"
      className="hidden md:table-cell"
    >
      <ReferenceField source="customer_id" reference="customers" link={false}>
        <AddressField />
      </ReferenceField>
    </DataTable.Col>
  </DataTable>
);
