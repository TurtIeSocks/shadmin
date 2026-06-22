import { RecordContextProvider } from "shadmin-core";
import { UsageMeterField } from "shadmin/components/admin";

export default function UsageMeterFieldExample() {
  return (
    <RecordContextProvider
      value={{ id: 1, storage_used: 7.2, storage_limit: 10 }}
    >
      <UsageMeterField
        source="storage_used"
        limitSource="storage_limit"
        unit="GB"
      />
    </RecordContextProvider>
  );
}
