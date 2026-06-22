import { RecordContextProvider, Form } from "shadmin-core";
import { CurrencyInput } from "shadmin/components/admin";

export default function CurrencyInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, price: 49.99 }}>
      <Form>
        <CurrencyInput source="price" currency="USD" />
      </Form>
    </RecordContextProvider>
  );
}
