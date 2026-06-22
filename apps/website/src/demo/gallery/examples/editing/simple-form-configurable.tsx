import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import {
  SimpleFormConfigurable,
  TextInput,
  NumberInput,
} from "shadmin/components/admin";

export default function SimpleFormConfigurableExample() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider value={{ id: 1, name: "Widget Pro", price: 4999 }}>
        <SimpleFormConfigurable>
          <TextInput source="name" />
          <NumberInput source="price" />
        </SimpleFormConfigurable>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
