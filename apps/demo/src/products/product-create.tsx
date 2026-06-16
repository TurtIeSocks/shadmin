import {
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  ImageInput,
  ImageField,
  TranslatableInputs,
} from "shadmin/components/admin";
import { CurrencyInput } from "shadmin/components/extras/currency-input";
import { required } from "ra-core";

export const ProductCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="reference" label="Reference" validate={required()} />
      <ReferenceInput source="category_id" reference="categories">
        <AutocompleteInput label="Category" validate={required()} />
      </ReferenceInput>
      <div className="grid grid-cols-2 gap-2">
        <TextInput source="width" type="number" />
        <TextInput source="height" type="number" />
      </div>
      <CurrencyInput source="price" currency="USD" />
      <TextInput source="stock" label="Stock" type="number" />
      <ImageInput source="picture" accept={{ "image/*": [] }}>
        <ImageField source="src" title="title" />
      </ImageInput>
      <TranslatableInputs locales={["en", "fr"]} defaultLocale="en">
        <TextInput source="description" multiline />
      </TranslatableInputs>
    </SimpleForm>
  </Create>
);
