import { RecordContextProvider } from "shadmin-core";
import { FileField } from "shadmin/components/admin";

export default function FileFieldExample() {
  return (
    <RecordContextProvider
      value={{
        id: 1,
        attachment: "/files/q2-financial-report.pdf",
        filename: "Q2 Financial Report.pdf",
      }}
    >
      <FileField source="attachment" title="filename" />
    </RecordContextProvider>
  );
}
