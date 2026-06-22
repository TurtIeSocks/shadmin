import { RecordContextProvider, Form } from "shadmin-core";
import { RatingInput } from "shadmin/components/admin";

export default function RatingInputExample() {
  return (
    <RecordContextProvider value={{ id: 1, rating: 4 }}>
      <Form>
        <RatingInput source="rating" />
      </Form>
    </RecordContextProvider>
  );
}
