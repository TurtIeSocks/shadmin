import { RecordContextProvider } from "shadmin-core";
import { PhoneField } from "shadmin/components/admin";

export default function PhoneFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, phone: "+14155552671" }}>
      <PhoneField source="phone" displayFormat="international" />
    </RecordContextProvider>
  );
}
