import { RecordContextProvider } from "shadmin-core";
import { RecordField, TextField, NumberField } from "shadmin/components/admin";

export default function RecordFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, name: "Widget Pro", price: 99 }}>
      <div className="space-y-2">
        <RecordField source="name" label="Product Name">
          <TextField source="name" />
        </RecordField>
        <RecordField source="price" label="Price">
          <NumberField source="price" />
        </RecordField>
      </div>
    </RecordContextProvider>
  );
}
