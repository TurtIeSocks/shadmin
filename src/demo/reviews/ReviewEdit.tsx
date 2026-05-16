import {
  AutocompleteInput,
  RecordField,
  ReferenceField,
  SimpleForm,
  TextInput,
} from "@/components/admin";
import { RatingField } from "@/components/extras/rating-field";

import { EditBase } from "ra-core";
import { cn } from "@/lib/utils";

import { FullNameField } from "../customers/FullNameField";

export const ReviewEdit = ({
  id,
}: {
  id: string | number;
  onCancel?: () => void;
}) => (
  <EditBase id={id}>
    <SimpleForm>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RecordField source="customer_id">
          <ReferenceField source="customer_id" reference="customers">
            <FullNameField />
          </ReferenceField>
        </RecordField>

        <RecordField source="product_id">
          <ReferenceField source="product_id" reference="products" />
        </RecordField>

        <RecordField<{ date: string | number }>
          source="date"
          render={(record) => new Date(record.date).toLocaleDateString()}
        />
        <RecordField source="rating">
          <RatingField source="rating" max={5} />
        </RecordField>
      </div>
      <AutocompleteInput
        source="status"
        choices={[
          { id: "accepted", name: "Approved" },
          { id: "rejected", name: "Rejected" },
          { id: "pending", name: "Pending" },
        ]}
        optionText={(choice) => (
          <>
            <span
              className={cn(
                "size-2 rounded-full",
                choice.id === "accepted"
                  ? "bg-green-400 dark:bg-green-800"
                  : choice.id === "rejected"
                    ? "bg-red-400 dark:bg-red-800"
                    : "bg-yellow-400 dark:bg-yellow-800",
              )}
            />
            {choice.name}
          </>
        )}
      />
      <TextInput source="comment" multiline rows={5} />
    </SimpleForm>
  </EditBase>
);
