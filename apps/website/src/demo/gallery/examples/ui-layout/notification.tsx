import { Notification } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="relative">
      <Notification />
      <p className="text-sm text-muted-foreground">
        Notification renders a Sonner toaster. Trigger notifications with{" "}
        <code className="font-mono text-xs">useNotify()</code>.
      </p>
    </div>
  );
}
