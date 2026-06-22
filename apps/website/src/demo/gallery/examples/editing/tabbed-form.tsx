import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { TabbedForm, TextInput, NumberInput } from "shadmin/components/admin";

export default function TabbedFormExample() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider
        value={{ id: 1, name: "Widget Pro", price: 4999, description: "" }}
      >
        <TabbedForm syncWithLocation={false}>
          <TabbedForm.Tab label="Details">
            <TextInput source="name" />
            <TextInput source="description" multiline />
          </TabbedForm.Tab>
          <TabbedForm.Tab label="Pricing">
            <NumberInput source="price" />
          </TabbedForm.Tab>
        </TabbedForm>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
