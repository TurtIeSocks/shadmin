import { Placeholder } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Title:</span>
        <Placeholder className="w-48 h-4 rounded" />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Author:</span>
        <Placeholder className="w-32 h-4 rounded" />
      </div>
    </div>
  );
}
