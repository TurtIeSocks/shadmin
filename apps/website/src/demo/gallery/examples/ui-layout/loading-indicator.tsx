import { LoadingIndicator } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="flex items-center gap-4">
      <LoadingIndicator />
      <span className="text-sm text-muted-foreground">
        Shows a spinner while data is fetching, refresh button when idle.
      </span>
    </div>
  );
}
