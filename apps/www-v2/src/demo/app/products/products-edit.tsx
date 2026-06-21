import {
  AutocompleteArrayInput,
  AutocompleteInput,
  ColorInput,
  Edit,
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

/** Products edit — reference, category, price/stock, status, color, and tags. */
export const ProductsEdit = () => (
  <Edit>
    <SimpleForm className="max-w-xl">
      <TextInput source="reference" validate={required()} />
      <ReferenceInput source="category_id" reference="categories">
        <AutocompleteInput label="Category" validate={required()} />
      </ReferenceInput>
      <div className="grid grid-cols-2 gap-4">
        <NumberInput source="price" />
        <NumberInput source="stock" />
      </div>
      <SelectInput source="status" choices={STATUS_CHOICES} />
      <ColorInput source="color" />
      <ReferenceArrayInput source="tag_ids" reference="tags">
        <AutocompleteArrayInput label="Tags" />
      </ReferenceArrayInput>
      <TextInput source="description" multiline />
    </SimpleForm>
  </Edit>
);
