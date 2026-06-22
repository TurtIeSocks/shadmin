import {
  AutocompleteInput,
  BooleanField,
  BulkUpdateButton,
  DataTable,
  ExportButton,
  List,
  RatingField,
  ReferenceField,
  ReferenceInput,
  SelectInput,
} from "shadmin/components/admin";

const APPROVED_CHOICES = [
  { id: true, name: "Approved" },
  { id: false, name: "Pending" },
];

const filters = [
  <ReferenceInput
    key="customer_id"
    source="customer_id"
    reference="customers"
    sort={{ field: "last_name", order: "ASC" }}
  >
    <AutocompleteInput placeholder="Customer" label={false} />
  </ReferenceInput>,
  <ReferenceInput
    key="product_id"
    source="product_id"
    reference="products"
    sort={{ field: "reference", order: "ASC" }}
  >
    <AutocompleteInput placeholder="Product" label={false} />
  </ReferenceInput>,
  <SelectInput key="approved" source="approved" choices={APPROVED_CHOICES} />,
];

/** Bulk moderation — approve or reject selected reviews at once. */
const BulkApproveButton = () => (
  <BulkUpdateButton label="Approve" data={{ approved: true }} />
);

const BulkRejectButton = () => (
  <BulkUpdateButton
    label="Reject"
    data={{ approved: false }}
    variant="destructive"
  />
);

const ReviewsBulkActions = () => (
  <>
    <BulkApproveButton />
    <BulkRejectButton />
  </>
);

/**
 * Reviews list — the bulk-moderation highlight: rating, customer + product
 * references, approved flag, and bulk approve/reject actions.
 */
export const ReviewsList = () => (
  <List
    sort={{ field: "date", order: "DESC" }}
    filters={filters}
    perPage={25}
    actions={
      <div className="flex items-center gap-2">
        <ExportButton />
      </div>
    }
  >
    <DataTable bulkActionButtons={<ReviewsBulkActions />}>
      <DataTable.Col source="rating">
        <RatingField source="rating" />
      </DataTable.Col>
      <DataTable.Col
        source="customer_id"
        label="Customer"
        className="hidden md:table-cell"
      >
        <ReferenceField source="customer_id" reference="customers" />
      </DataTable.Col>
      <DataTable.Col
        source="product_id"
        label="Product"
        className="hidden md:table-cell"
      >
        <ReferenceField source="product_id" reference="products" />
      </DataTable.Col>
      <DataTable.Col
        source="date"
        render={(record) =>
          new Date(record.date as string).toLocaleDateString()
        }
        className="hidden lg:table-cell"
      />
      <DataTable.Col source="approved">
        <BooleanField source="approved" />
      </DataTable.Col>
    </DataTable>
  </List>
);
