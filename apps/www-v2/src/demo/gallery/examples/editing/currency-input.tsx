import { RecordContextProvider, Form } from "shadmin-core";
import { CurrencyInput } from "shadmin/components/admin";

export default function CurrencyInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, price: 4999 }}>
      <Form>
        <CurrencyInput source="price" />
      </Form>
    </RecordContextProvider>
  );
}
