import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { ReferenceManyCount } from "shadmin/components/admin";

export default function ReferenceManyCountExample() {
  return (
    <ResourceContextProvider value="customers">
      <RecordContextProvider
        value={{ id: 1, first_name: "Jane", last_name: "Doe" }}
      >
        <div className="flex items-center gap-2 text-sm">
          <span>Orders:</span>
          <ReferenceManyCount reference="orders" target="customer_id" />
        </div>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
