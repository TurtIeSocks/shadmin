import {
  ColorField,
  NumberField,
  RatingField,
  ReferenceArrayField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
} from "shadmin/components/admin";

/** Products show — key fields plus resolved category and tag references. */
export const ProductsShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="reference" />
      <ReferenceField source="category_id" reference="categories" />
      <NumberField
        source="price"
        options={{ style: "currency", currency: "USD" }}
      />
      <NumberField source="stock" />
      <TextField source="status" />
      <RatingField source="rating" />
      <ColorField source="color" />
      <ReferenceArrayField source="tag_ids" reference="tags">
        <SingleFieldList />
      </ReferenceArrayField>
      <TextField source="description" />
    </SimpleShowLayout>
  </Show>
);
