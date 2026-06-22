import { RecordContextProvider, Form } from "shadmin-core";
import { ImageInput } from "shadmin/components/admin";

export default function ImageInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, avatar: null }}>
      <Form>
        <ImageInput source="avatar" />
      </Form>
    </RecordContextProvider>
  );
}
