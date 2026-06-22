import { Count } from "shadmin/components/admin";

export default function CountExample() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>Orders:</span>
      <Count resource="orders" />
    </div>
  );
}
