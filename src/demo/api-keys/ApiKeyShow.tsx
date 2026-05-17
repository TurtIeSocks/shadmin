import {
  DateField,
  Labeled,
  Show,
  SimpleShowLayout,
  TextField,
} from "@/components/admin";
import { ApiKeyField } from "@/components/extras/api-key-field";
import { ApiKeyInput } from "@/components/extras/api-key-input";

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
