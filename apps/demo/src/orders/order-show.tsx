import {
  DateField,
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from "shadmin/components/admin";
import {
  BlockDocField,
  dataBlocks,
  defaultBlocks,
} from "shadmin/components/block-editor";
import { CommentsThread } from "shadmin/components/extras/comments-thread";

export const OrderShow = () => (
  <Show>
    <div className="flex gap-6">
      <div className="flex-1">
        <SimpleShowLayout>
          <TextField source="reference" />
          <ReferenceField source="customer_id" reference="customers" />
          <DateField source="date" showTime />
          <TextField source="status" />
          <NumberField
            source="total"
            options={{ style: "currency", currency: "USD" }}
          />
          <BlockDocField
            source="notes"
            blocks={[...defaultBlocks, ...dataBlocks]}
          />
        </SimpleShowLayout>
      </div>
      <aside className="w-80 border-l pl-6">
        <CommentsThread
          reference="order_comments"
          target="order_id"
          resolvable
        />
      </aside>
    </div>
  </Show>
);
