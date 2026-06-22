import { RecordContextProvider } from "shadmin-core";
import { Labeled, TextField } from "shadmin/components/admin";

export default function Example() {
  return (
    <RecordContextProvider
      value={{ id: 1, title: "Hello World", author: "Jane Doe" }}
    >
      <div className="flex flex-col gap-4">
        <Labeled label="Post Title">
          <TextField source="title" />
        </Labeled>
        <Labeled label="Author">
          <TextField source="author" />
        </Labeled>
      </div>
    </RecordContextProvider>
  );
}
