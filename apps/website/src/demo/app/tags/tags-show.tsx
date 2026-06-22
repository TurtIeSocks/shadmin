import {
  ColorField,
  Show,
  SimpleShowLayout,
  TextField,
} from "shadmin/components/admin";

/** Tags show — name and color. */
export const TagsShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <ColorField source="color" />
    </SimpleShowLayout>
  </Show>
);
