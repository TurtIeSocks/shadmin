import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import {
  SimpleForm,
  TranslatableInputs,
  TextInput,
} from "shadmin/components/admin";

export default function TranslatableInputsExample() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider
        value={{
          id: 1,
          name: { en: "Hello", fr: "Bonjour" },
        }}
      >
        <SimpleForm>
          <TranslatableInputs locales={["en", "fr"]}>
            <TextInput source="name" />
          </TranslatableInputs>
        </SimpleForm>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
