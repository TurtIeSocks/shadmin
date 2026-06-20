import { DemoAdmin } from "@/docs/demo-kit/demo-admin";

export default function DemoAdminCheckDemo() {
  return (
    <div className="flex flex-col gap-2">
      <span>admin context ok</span>
      <DemoAdmin>
        <span className="text-muted-foreground text-sm">ra-core context mounted</span>
      </DemoAdmin>
    </div>
  );
}
