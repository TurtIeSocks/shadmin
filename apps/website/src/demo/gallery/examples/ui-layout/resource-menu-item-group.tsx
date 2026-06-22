// ResourceMenuItemGroup renders a labeled, collapsible cluster of
// ResourceMenuItems from the Admin registry; it can't resolve resources without
// the full <Admin>, so describe it + point at the live usage.
export default function Example() {
  return (
    <div className="mx-auto max-w-md rounded-lg border bg-muted/30 p-6 text-sm">
      <p className="font-medium text-foreground">ResourceMenuItemGroup</p>
      <p className="mt-1.5 text-muted-foreground">
        Groups several{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          ResourceMenuItem
        </code>{" "}
        links under a collapsible, labeled heading in the Admin sidebar — handy
        for organizing many resources. It needs the full Admin resource registry
        to resolve its items.
      </p>
    </div>
  );
}
