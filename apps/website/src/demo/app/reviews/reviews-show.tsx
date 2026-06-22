import {
  BooleanField,
  DateField,
  RatingField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from "shadmin/components/admin";

/** Reviews show — rating, references, approval status, date, and comment. */
export const ReviewsShow = () => (
  <Show>
    <SimpleShowLayout>
      <RatingField source="rating" />
      <ReferenceField source="customer_id" reference="customers" />
      <ReferenceField source="product_id" reference="products" />
      <BooleanField source="approved" />
      <DateField source="date" />
      <TextField source="comment" />
    </SimpleShowLayout>
  </Show>
);
