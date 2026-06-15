import {
  DateField,
  Labeled,
  Show,
  SimpleShowLayout,
  TextField,
} from "shadmin/components/admin";
import { ApiKeyField } from "shadmin/components/extras/api-key-field";
import { ApiKeyInput } from "shadmin/components/extras/api-key-input";

export const ApiKeyShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <Labeled label="Key">
        <ApiKeyField
          source="key"
          scopesSource="scopes"
          lastUsedSource="last_used"
        />
      </Labeled>
      <DateField source="created_at" />
      <Labeled label="Rotate">
        <ApiKeyInput source="key" />
      </Labeled>
    </SimpleShowLayout>
  </Show>
);
