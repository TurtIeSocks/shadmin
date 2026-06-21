import { RecordContextProvider, Form } from "shadmin-core";
import { ColorInput } from "shadmin/components/admin";

export default function ColorInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, brand_color: "#6366f1" }}>
      <Form>
        <ColorInput source="brand_color" />
      </Form>
    </RecordContextProvider>
  );
}
