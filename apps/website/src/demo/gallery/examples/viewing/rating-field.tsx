import { RecordContextProvider } from "shadmin-core";
import { RatingField } from "shadmin/components/admin";

export default function RatingFieldExample() {
  return (
    <RecordContextProvider value={{ id: 1, rating: 4 }}>
      <RatingField source="rating" max={5} />
    </RecordContextProvider>
  );
}
