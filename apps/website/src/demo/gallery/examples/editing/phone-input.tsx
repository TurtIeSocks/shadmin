import { RecordContextProvider, Form } from "shadmin-core";
import { PhoneInput } from "shadmin/components/admin";

export default function PhoneInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, phone: "+1 555 000 1234" }}>
      <Form>
        <PhoneInput source="phone" />
      </Form>
    </RecordContextProvider>
  );
}
