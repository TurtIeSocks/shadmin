import { RecordContextProvider, Form } from "shadmin-core";
import { MonacoJsonInput } from "shadmin/components/monaco";

export default function MonacoJsonInputExample() {
  return (
    <RecordContextProvider
      value={{
        id: 1,
        metadata: { sku: "ABC-123", price: 4200 },
      }}
    >
      <Form>
        <MonacoJsonInput source="metadata" />
      </Form>
    </RecordContextProvider>
  );
}
