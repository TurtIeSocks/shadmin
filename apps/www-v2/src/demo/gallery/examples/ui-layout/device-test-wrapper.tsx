import { DeviceTestWrapper } from "shadmin/components/admin";

export default function Example() {
  return (
    <DeviceTestWrapper width="md">
      <div className="rounded border p-4 text-sm">
        Content rendered at md (900px) viewport width.
      </div>
    </DeviceTestWrapper>
  );
}
