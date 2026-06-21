import { RecordContextProvider } from "shadmin-core";
import { FileField } from "shadmin/components/admin";

export default function FileFieldExample() {
  return (
    <RecordContextProvider
      value={{ id: 1, attachment: { src: "/sample.pdf", title: "report.pdf" } }}
    >
      <FileField source="attachment" src="src" title="title" />
    </RecordContextProvider>
  );
}
