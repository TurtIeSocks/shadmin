import {
  ColorField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from "shadmin/components/admin";

/** Categories show — name, parent reference, and color. */
export const CategoriesShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <ReferenceField source="parent_id" reference="categories" />
      <ColorField source="color" />
    </SimpleShowLayout>
  </Show>
);
