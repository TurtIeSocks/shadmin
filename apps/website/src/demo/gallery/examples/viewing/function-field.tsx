import { RecordContextProvider } from "shadmin-core";
import { FunctionField } from "shadmin/components/admin";

export default function FunctionFieldExample() {
  return (
    <RecordContextProvider
      value={{ id: 1, first_name: "Jane", last_name: "Doe" }}
    >
      <FunctionField
        render={(record) =>
          `${record?.first_name ?? ""} ${record?.last_name ?? ""}`.trim()
        }
      />
    </RecordContextProvider>
  );
}
