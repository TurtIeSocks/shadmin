import { CheckForApplicationUpdate } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="relative min-h-12">
      <CheckForApplicationUpdate disabled />
      <p className="text-sm text-muted-foreground">
        CheckForApplicationUpdate polls for new versions in the background.
        Disabled here to avoid network requests.
      </p>
    </div>
  );
}
