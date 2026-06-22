import {
  AutocompleteArrayInput,
  AutocompleteInput,
  ColorInput,
  Create,
  NumberInput,
  ReferenceArrayInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
} from "shadmin/components/admin";
import { required } from "shadmin-core";

const STATUS_CHOICES = [
  { id: "draft", name: "Draft" },
  { id: "active", name: "Active" },
  { id: "archived", name: "Archived" },
];

/** Products create — same key fields as edit, blank record. */
export const ProductsCreate = () => (
  <Create>
    <SimpleForm className="max-w-xl">
      <TextInput source="reference" validate={required()} />
      <ReferenceInput source="category_id" reference="categories">
        <AutocompleteInput label="Category" validate={required()} />
      </ReferenceInput>
      <div className="grid grid-cols-2 gap-4">
        <NumberInput source="price" />
        <NumberInput source="stock" />
      </div>
      <SelectInput
        source="status"
        choices={STATUS_CHOICES}
        defaultValue="draft"
      />
      <ColorInput source="color" />
      <ReferenceArrayInput source="tag_ids" reference="tags">
        <AutocompleteArrayInput label="Tags" />
      </ReferenceArrayInput>
      <TextInput source="description" multiline />
    </SimpleForm>
  </Create>
);
