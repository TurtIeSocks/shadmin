import {
  Create,
  SelectArrayInput,
  SimpleForm,
  TextInput,
} from "shadcn-admin-kit/components/admin";

const SCOPE_CHOICES = [
  { id: "read:orders", name: "Read orders" },
  { id: "write:orders", name: "Write orders" },
  { id: "read:customers", name: "Read customers" },
  { id: "write:customers", name: "Write customers" },
  { id: "admin", name: "Admin (full access)" },
];

export const ApiKeyCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" />
      <SelectArrayInput source="scopes" choices={SCOPE_CHOICES} />
    </SimpleForm>
  </Create>
);
