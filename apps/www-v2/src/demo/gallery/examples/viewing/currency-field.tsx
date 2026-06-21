import { RecordContextProvider } from "shadmin-core";
import { CurrencyField } from "shadmin/components/admin";

export default function CurrencyFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, price: 4999 }}>
      <CurrencyField source="price" currency="USD" storeAsMinorUnits />
    </RecordContextProvider>
  );
}
