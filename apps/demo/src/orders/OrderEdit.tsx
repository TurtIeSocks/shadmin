import {
  BooleanInput,
  Edit,
  RecordField,
  ReferenceField,
  SimpleForm,
} from "shadmin/components/admin";
import {
  BlockEditorInput,
  dataBlocks,
  defaultBlocks,
} from "shadmin/components/block-editor";
import { StatusTransitionButton } from "shadmin/components/extras/status-transition-button";
import { RecordRepresentation } from "ra-core";
import { Link } from "react-router";
import { Basket } from "./Basket";
import { Totals } from "./Totals";
import { ORDER_TRANSITIONS } from "./order-transitions";
import type { Order } from "../types";

export const OrderEdit = () => (
  <Edit>
    <SimpleForm className="max-w-xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-2">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <RecordField<Order>
              source="date"
              render={(record) => new Date(record.date).toLocaleString()}
              className="flex-1 md:text-sm"
            />
            <RecordField source="reference" className="flex-1 md:text-sm" />
          </div>
          <div className="mb-4">
            <StatusTransitionButton
              source="status"
              transitions={ORDER_TRANSITIONS}
            />
          </div>
          <BooleanInput source="returned" />
        </div>
        <div className="flex-1">
          <div className="text-xs opacity-75">Customer</div>
          <ReferenceField
            source="customer_id"
            reference="customers"
            link={false}
            render={({ referenceRecord }) => (
              <div className="mb-4 md:text-sm">
                <Link to={`/customers/${referenceRecord?.id}`}>
                  <RecordRepresentation />
                </Link>
                <br />
                <a
                  className="underline md:text-sm"
                  href={`mailto:${referenceRecord?.email}`}
                >
                  {referenceRecord?.email}
                </a>
              </div>
            )}
          />
          <div className="text-xs opacity-75">Shipping Address</div>
          <ReferenceField
            source="customer_id"
            reference="customers"
            render={({ referenceRecord }) =>
              referenceRecord && (
                <div className="md:text-sm">
                  {referenceRecord.address}
                  <br />
                  {referenceRecord.city}, {referenceRecord.stateAbbr}{" "}
                  {referenceRecord.zipcode}
                </div>
              )
            }
          ></ReferenceField>
        </div>
      </div>
      <Basket />
      <Totals />
      <BlockEditorInput
        source="notes"
        label="Notes"
        helperText="Internal notes for this order. Type / to insert a block."
        blocks={[...defaultBlocks, ...dataBlocks]}
      />
    </SimpleForm>
  </Edit>
);
